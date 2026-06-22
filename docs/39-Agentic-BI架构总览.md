# Ch 39 Agentic BI 架构总览

!!! info "面包屑"
    [本书主页](./index.md) › [Part VII Data+AI 转型](./38-时代命题-AI-Ready数据供应.md) › Ch 39

!!! abstract "项目第 4 年 · Data+AI 转型期——架构设计"

---

## :material-school: 本章你将学到
- 双平面分离：语义平面（治理）+ 数据平面（执行）
- 五层逻辑模型（L1 交互→L5 治理，单向调用）
- 9 步在线查询流的完整链路
- 确定性 DAG + 条件路由 vs ReAct 自治的取舍

---

[Ch 38](./38-时代命题-AI-Ready数据供应.md) 说了"为什么要做 Agentic BI"，这一章讲"Agentic BI 的架构怎么设计"。

设计这个架构时，我面临的最大挑战是：**怎么让 LLM 生成的 SQL 既"灵活"又"安全"？** 灵活——用户什么问题都能问；安全——AI 不能生成危险 SQL、不能泄露敏感数据、不能查错口径。

这两个要求看似矛盾。如果给 LLM 太多自由，它可能"自由发挥"出错误的 SQL；如果限制太死，它又无法回答灵活的问题。解决方案的核心思想是：**把"知识"和"执行"分开**——用一个"语义平面"把业务知识（指标定义、术语映射、join 路径）编码为机器可读的约束，让 LLM 在受约束的空间内"发挥"，而不是在"整个数仓"里"猜"。这个思想后来演化为"双平面分离"架构。

我在专利数据领域有过类似经验——专利检索系统也是"让用户用自然语言查专利"，当时用了一套"专利分类体系+同义词词典"来约束检索范围。Agentic BI 的语义平面是同一个思想的升级版，只是约束更细、执行更复杂。

---

## 39.1 双平面分离：语义平面（治理）+ 数据平面（执行）
```mermaid
C4Context
 title Agentic BI — System Context (双平面分离)

 Person(user, "业务用户", "用自然语言提问，获取数据洞察和可视化推荐，无需懂 SQL 或数据模型")

 Enterprise_Boundary(agentic_bi, "Agentic BI 系统") {
 System(semantic, "语义平面", "治理资产仓库（Git+YAML）：管理业务术语、指标定义、表关系、join 路径、安全策略。离线 PR 驱动发布")
 System(data_plane, "数据平面", "Redshift Serverless：在线执行 LLM 生成的受约束 SQL，返回查询结果给前端可视化层")
 System(retrieval, "检索层 R/V/G/D", "四引擎并行 RAG：Retrieval-语义检索 / Vector-向量相似 / Graph-知识图谱 / Dictionary-术语词典")
 System(sql_gen, "SQL 生成引擎", "LLM 在语义约束下生成 SQL：意图→Router（7 路由决策）→Steiner 树 join 规划→五层护栏→生成")
 }

 Person(gov, "语义管理员", "通过 Git PR 定义和维护治理资产（术语/指标/规则），审批后自动发布到语义平面")

 Rel(user, semantic, "提出自然语言问题（例：'上季度华东区处方贡献排名'）", "HTTP/SSE")
 Rel(gov, semantic, "PR 提交治理变更——新增术语/修改指标定义/更新 join 路径", "Git + YAML + PR Review")
 Rel(semantic, retrieval, "发布治理资产——元数据/术语/指标/关系 同步到检索索引", "离线批量同步")
 Rel(retrieval, sql_gen, "注入约束上下文——检索到的表结构/术语映射/join 路径/指标公式", "Context Injection via LangGraph")
 Rel(sql_gen, data_plane, "执行受五层护栏校验的 SQL", "Redshift Data API")
 Rel(data_plane, user, "返回查询结果 + 规则化可视化推荐（图表类型/配色）", "SSE Stream")

 UpdateElementStyle(user, $bgColor="#f2f4f8", $fontColor="#161616", $borderColor="#697077")
 UpdateElementStyle(gov, $bgColor="#f2f4f8", $fontColor="#161616", $borderColor="#697077")
 UpdateElementStyle(semantic, $bgColor="#f6f2ff", $fontColor="#161616", $borderColor="#8a3ffc")
 UpdateElementStyle(data_plane, $bgColor="#d9fbfb", $fontColor="#161616", $borderColor="#007d79")
 UpdateElementStyle(retrieval, $bgColor="#edf5ff", $fontColor="#161616", $borderColor="#0f62fe")
 UpdateElementStyle(sql_gen, $bgColor="#fcf4d6", $fontColor="#161616", $borderColor="#f1c21b")

 UpdateRelStyle(semantic, retrieval, $textColor="#8a3ffc", $lineColor="#8a3ffc")
 UpdateRelStyle(retrieval, sql_gen, $textColor="#0f62fe", $lineColor="#0f62fe")
 UpdateRelStyle(sql_gen, data_plane, $textColor="#f1c21b", $lineColor="#f1c21b")

 UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="2")
```
<p class="caption" markdown="span">**图 39-1** 双平面分离：语义平面（治理）+ 数据平面（执行）</p>

| 平面 | 职责 | 管理方式 | 更新频率 |
|---|---|---|---|
| **语义平面** | 治理资产（元数据/术语/规则/指标定义） | Git + :simple-yaml: YAML，离线发布 | 低频（ :octicons-git-pull-request-16: PR 驱动） |
| **数据平面** | SQL 执行（查询/加载） | Redshift Serverless | 高频（每次查询） |
<p class="caption" markdown="span">**表 39-1** 双平面分离：语义平面（治理）+ 数据平面（执行）</p>


### 为什么要分离

!!! tip "引申：基石回扣——双平面分离 = 配置驱动的 AI 延伸"
    双平面分离的本质是"治理与执行解耦"。语义平面是"知识"——它定义"GMV 是什么、怎么算、用哪些表"；数据平面是"执行"——它执行"算出来的 SQL"。分离让治理变更（如修改 GMV 定义）不影响执行引擎，执行引擎升级不影响治理资产。

    这与 CDP 平台的"配置驱动"理念一脉相承——[Ch 11](./11-配置与状态管理.md) 把"做什么"（runtime config in DynamoDB）和"在哪跑"（deploy config in Terraform）分开管理；Agentic BI 把"知识"（语义平面 Git+YAML）和"执行"（数据平面 Redshift）分开管理。**同一个分离原则，在不同抽象层级反复应用**——runtime config 描述"任务怎么跑"，语义资产描述"AI 怎么理解业务"，两者都是"把描述与执行解耦"。这也是 ADR-1（双平面分离）的核心决策依据。

---

## 39.2 五层逻辑模型（L1 交互→L5 治理，单向调用）
```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
 L5@{ icon: "codicon:shield", form: "rounded", label: "L5 治理层<br/>语义治理资产<br/>元数据/术语/规则", pos: "b", h: 40 }
 L4@{ icon: "logos:aws-redshift", form: "rounded", label: "L4 数据层<br/>Redshift Serverless<br/>数据存储与执行", pos: "b", h: 40 }
 L3@{ icon: "codicon:hubot", form: "rounded", label: "L3 智能层<br/>Agent 编排<br/>RAG/规划/生成/护栏", pos: "b", h: 40 }
 L2@{ icon: "codicon:graph", form: "rounded", label: "L2 编排层<br/>LangGraph 状态机<br/>流程控制", pos: "b", h: 40 }
 L1@{ icon: "codicon:comment", form: "rounded", label: "L1 交互层<br/>前端 UI<br/>对话/可视化", pos: "b", h: 40 }

 L1 --> L2 --> L3 --> L4
 L5 -.->|约束|L3
 L5 -.->|约束|L4

 classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
 classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
 classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
 classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616

 class L5 bpInfo
 class L4 bpData
 class L3 bpProcess
 class L2 bpProcess
 class L1 bpProcess

 linkStyle default stroke:#697077,stroke-width:2px
 linkStyle 0,1,2 stroke:#0f62fe,stroke-width:2px
 linkStyle 3,4 stroke:#8a3ffc,stroke-width:2px,stroke-dasharray:5
```
<p class="caption" markdown="span">**图 39-2** 五层逻辑模型（L1 交互→L5 治理，单向调用）</p>

| 层 | 职责 | 技术 |
|---|---|---|
| **L1 交互** | 对话界面、结果可视化、SSE 流式 | Next.js + :simple-react: React |
| **L2 编排** | Agent 流程状态机、路由决策 | LangGraph |
| **L3 智能** | RAG 检索、SQL 规划/生成/护栏 | LangGraph + LLM |
| **L4 数据** | SQL 执行、数据存储 | Redshift Serverless |
| **L5 治理** | 语义资产、术语、业务规则 | Git + YAML |
<p class="caption" markdown="span">**表 39-2** 五层逻辑模型（L1 交互→L5 治理，单向调用）</p>


**核心原则：依赖只能向下，L5 治理层约束 L3/L4 但不被它们修改。**

---

## 39.3 9 步在线查询流
```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
 S1[① 用户提问] --> S2[② Supervisor<br/>嵌入+治理叠加]
 S2 --> S3[③ Query Understanding<br/>LLM 意图/实体识别]
 S3 --> S4[④ Router<br/>7 路由决策]
 S4 --> S5[⑤ R/V/G/D 检索<br/>四引擎并行]
 S5 --> S6[⑥ 语义规划器<br/>Steiner 树 join 规划]
 S6 --> S7[⑦ SQL 生成<br/>LLM 约束生成]
 S7 --> S8[⑧ 五层护栏<br/>语法/策略/AST/术语/成本]
 S8 --> S9[⑨ 执行+可视化<br/>Redshift 执行+图表]
 S9 --> S10[返回用户]

 classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
 classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
 classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
 classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
 classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616

 class S1 bpProcess
 class S2,S3,S4 bpInfo
 class S5 bpData
 class S6,S7 bpProcess
 class S8 bpProcess
 class S9,S10 bpSuccess
```
<p class="caption" markdown="span">**图 39-3** 9 步在线查询流</p>

| 步骤 | 做什么 | 关键设计 |
|---|---|---|
| ① 提问 | 用户用自然语言提问 | 前端 SSE 流式 |
| ② Supervisor | 嵌入问题 + 叠加治理上下文 | 轻量入口 |
| ③ 查询理解 | LLM 识别意图和实体 | 意图分类 |
| ④ 路由 | 7 条确定性路由决策 | 条件路由非 ReAct |
| ⑤ 检索 | R/V/G/D 四引擎并行检索语义资产 | 四引擎 RAG |
| ⑥ 规划 | Steiner 树求最小代价 join 子图 | 代数改写 |
| ⑦ 生成 | LLM 在约束下生成 SQL | 约束生成 |
| ⑧ 护栏 | 五层校验+自愈回路 | 安全护栏 |
| ⑨ 执行 | Redshift 执行+可视化推荐 | 规则化可视化 |
<p class="caption" markdown="span">**表 39-3** 9 步在线查询流</p>


---

## 39.4 确定性 DAG + 条件路由 vs ReAct 自治的取舍
```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
 subgraph 本书方案["确定性 DAG + 条件路由（本书方案）"]
 direction TB
 A1[用户提问] --> A2[Supervisor<br/>嵌入+治理叠加]
 A2 --> A3{意图路由}
 A3 -->|简单查询|A4[直接 SQL 生成]
 A3 -->|复杂分析|A5[R/V/G/D 检索]
 A3 -->|元数据问题|A6[元数据查询]
 A4 --> A7[护栏校验]
 A5 --> A8[Steiner 规划] --> A7
 A6 --> A7
 A7 --> A9[执行+可视化]
 end

 subgraph ReAct自治["ReAct 自治（对比）"]
 direction TB
 B1[用户提问] --> B2[LLM 思考<br/>决定下一步]
 B2 --> B3[执行动作]
 B3 --> B4[观察结果]
 B4 --> B5{任务完成?}
 B5 -->|否|B2
 B5 -->|尝试达到上限|B6[可能超边界]
 end

 classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
 classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
 classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
 classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
 classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616

 class A1,A2,A4,A5,A6,A8,A9 bpProcess
 class A3 bpDecision
 class A7 bpSuccess
 class B1 bpProcess
 class B2,B3,B4 bpInfo
 class B5 bpDecision
 class B6 bpError
```
<p class="caption" markdown="span">**图 39-4** 确定性 DAG + 条件路由 vs ReAct 自治的取舍</p>

| 维度 | 确定性 DAG（本书） | ReAct 自治 |
|---|---|---|
| **流程控制** | 预定义 DAG + 条件分支 | LLM 自主决策 |
| **可预测性** | 高（路径确定） | 低（LLM 可能走偏） |
| **灵活性** | 中（条件路由适应变化） | 高（完全自主） |
| **调试** | 易（路径可追踪） | 难（每次路径不同） |
| **安全** | 高（护栏在节点间） | 低（自主行为难约束） |
| **适合场景** | 企业级（需可靠/安全） | 探索性（容错高） |
<p class="caption" markdown="span">**表 39-4** 确定性 DAG + 条件路由 vs ReAct 自治的取舍</p>


!!! warning "Trade-off"
    选确定性 DAG 的核心理由是"企业级可靠性"——在医药行业，AI 执行 SQL 必须可预测、可审计、可追责。ReAct 的自主性虽灵活，但"每次路径不同"让审计和排障极困难。确定性 DAG 的条件路由已足够应对"不同意图走不同路径"的灵活性需求，同时保证了流程可追踪。

---

## 39.5 引申：Agentic BI 的三种范式对比
```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
quadrantChart
 title Agentic BI 三种范式定位
 x-axis "低 SaaS 依赖" --> "高 SaaS 依赖"
 y-axis "弱治理" --> "强治理"
 quadrant-1 "企业级定制"
 quadrant-2 "全托管+强治理"
 quadrant-3 "个人探索"
 quadrant-4 "低管控"
 "ChatGPT Data Analyst": [0.15, 0.12]
 "Cortex Analyst (Snowflake)": [0.72, 0.62]
 "自建 Agentic BI (本书)": [0.3, 0.88]
 "Tableau AI": [0.55, 0.35]
 "Databricks AI/BI": [0.42, 0.55]
```
<p class="caption" markdown="span">**图 39-5** 引申：Agentic BI 的三种范式对比</p>

| 维度 | ChatGPT DA | Cortex Analyst | 自建（NewtonData） |
|---|---|---|---|
| **语义治理** | 无 | 有（:simple-snowflake: Snowflake 语义层） | 有（三层治理+Git） |
| **数据仓库** | 任意（通过代码） | 仅 Snowflake | Redshift/可扩展 |
| **安全护栏** | 弱 | 中（平台内置） | 强（五层护栏） |
| **定制性** | 低 | 中 | 高（全栈可控） |
| **运维成本** | 零（SaaS） | 低（平台托管） | 高（自维护） |
| **适合场景** | 个人探索 | Snowflake 用户 | 企业级深度定制 |
<p class="caption" markdown="span">**表 39-5** 引申：Agentic BI 的三种范式对比</p>


!!! tip "引申"
    自建 Agentic BI 的核心价值是"全栈可控"——语义治理、Agent 编排、护栏、执行引擎全部自主。代价是运维成本高。对于有深度定制需求的企业（如医药行业的 GxP 合规、特殊术语治理），自建是值得的。对于标准化需求，Cortex Analyst 这类平台方案更经济。

---

## :material-check-circle: 本章小结
- 双平面分离：语义平面（Git+YAML 治理资产，离线发布）+ 数据平面（Redshift Serverless，在线执行）
- 五层逻辑模型：L1 交互→L2 编排→L3 智能→L4 数据→L5 治理，依赖只能向下，L5 约束 L3/L4
- 9 步查询流：提问→Supervisor→查询理解→路由→R/V/G/D 检索→Steiner 规划→SQL 生成→五层护栏→执行+可视化
- 选确定性 DAG + 条件路由而非 ReAct：企业级需要可预测、可审计、可追责
- 三种范式：ChatGPT DA（无治理）/ Cortex（绑 Snowflake）/ 自建（全栈可控）——按定制需求和运维能力选择

---

!!! quote "下一章"
    [Ch 40 语义平面：三层治理与 Git+YAML](./40-语义平面-三层治理与Git-YAML.md) —— 架构总览清楚了，接下来深入第一块——语义平面的三层治理设计。

