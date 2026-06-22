# Ch 40 语义平面：三层治理与 Git+:simple-yaml: YAML
!!! info "面包屑"
    [本书主页](./index.md) › [Part VII Data+AI 转型](./39-Agentic-BI架构总览.md) › Ch 40

!!! abstract "项目第 4 年 · Data+AI转型期——语义平面"

---

## :material-school: 本章你将学到
- 三层治理：L1 元数据契约 / L2 术语治理 / L3 业务规则，以及对应的 YAML 资产示例
- 资产类型体系（9 种，含 Join/Few-shot YAML）与 Git+YAML 选型理由
- System Prompt 设计：分层模板 + few-shot 分级注入 + 术语绑定强路由
- 离线发布管线设计（含 CI 引用完整性校验伪代码）
- 对比 dbt Semantic Layer / Cube 的语义层设计

---

## 40.1 三层治理：L1 元数据契约 / L2 术语治理 / L3 业务规则
[Ch 39](./39-Agentic-BI架构总览.md) 讲了 Agentic BI 的整体架构，其中"语义平面"是治理层的核心。这一章深入语义平面的内部设计——它怎么把"人的业务知识"变成"机器可读的约束"。

我在专利数据领域做过类似的事。专利检索系统需要理解"同义词"——用户搜"锂电池"，系统要知道它也属于"二次电池""储能器件"这些概念。当时我们维护了一个"专利术语词典"，把同义词、上下位词、相关词编码为机器可读的映射。Agentic BI 的语义平面是这个思想的升级版——不只是术语映射，还包括指标定义、join 路径、业务规则，形成一套完整的"机器可读业务知识库"。

但语义平面最大的挑战不是"设计"——而是"维护"。谁来写这些 YAML？怎么保证它们正确？怎么让变更受控？这些问题比技术设计更难，也是这一章重点讨论的。

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
 subgraph 三层治理[“语义平面三层治理”]
 L1[L1 元数据契约<br/>表/列/指标/ join / few-shot 定义<br/>机器可读的结构化描述]
 L2[“L2 术语治理<br/>业务术语→技术资产映射<br/>如 “GMV”→metric_gmv”]
 L3[“L3 业务规则与上下文<br/>计算规则/约束/适用场景<br/>如 “GMV 不含退货订单””]
 end

 L3 -->|规则约束|L2
 L2 -->|术语绑定|L1
 L1 -->|供检索|RAG[R/V/G/D 四引擎]
linkStyle default stroke:#697077,stroke-width:2px
classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
class L1 bpData
class L2 bpInfo
class L3 bpInfo
class RAG bpProcess
```
<p class="caption" markdown="span">**图 40-1** 三层治理：L1 元数据契约 / L2 术语治理 / L3 业务规则</p>

| 层 | 职责 | 举例 |
|---|---|---|
| **L1 元数据契约** | 表/列/指标/join 的结构化定义 | `table: fact_prescription, columns: [...]` |
| **L2 术语治理** | 业务术语→技术资产映射 | `term: "GMV" → metric: metric_gmv` |
| **L3 业务规则** | 计算规则/约束/上下文 | `rule: GMV = SUM(amount) WHERE status='completed'` |
<p class="caption" markdown="span">**表 40-1** 三层治理：L1 元数据契约 / L2 术语治理 / L3 业务规则</p>


### 三层的关系

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
 TERM[“业务术语”GMV””] -->|L2 绑定|METRIC[指标 metric_gmv]
 METRIC -->|L1 定义|TABLES[涉及表 fact_orders + dim_status]
 RULE[“L3 规则<br/>”GMV 不含退货””] -->|约束|METRIC
linkStyle default stroke:#697077,stroke-width:2px
classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
class TERM bpInfo
class METRIC bpData
class TABLES bpData
class RULE bpInfo
```
<p class="caption" markdown="span">**图 40-2** 三层的关系</p>

!!! tip "引申"
    三层治理的本质是"把业务知识分层编码"。L1 是"数据长什么样"（结构），L2 是"业务术语对应什么"（映射），L3 是"怎么算才对"（规则）。这三层从不同维度约束 LLM 的搜索空间——LLM 不是在"整个数仓中猜"，而是在"受约束的语义空间中推理"。

把上面表格里的 GMV 例子落到 YAML，三层资产各是一个文件，相互引用、由 CI 校验引用完整性：

```yaml
# 示意：L1 元数据契约——Table 资产（fact_orders 的结构化描述）
# 文件：semantic-assets/tables/fact_orders.yaml
asset_type: table
name: fact_orders
description: "订单事实表，记录每笔销售订单"
columns:
  - name: order_id
    type: string
    role: primary_key
    sensitivity: P2
  - name: product_id
    type: string
    role: foreign_key
    references: dim_product.product_id
  - name: amount
    type: decimal
    description: "订单金额（含税）"
  - name: status
    type: string
    description: "订单状态：completed/returned/cancelled"
grain: "一行 = 一笔订单"
```

```yaml
# 示意：L2 术语治理——Term 资产（业务术语 "GMV" → 技术资产映射）
# 文件：semantic-assets/terms/gmv.yaml
asset_type: term
name: GMV
synonyms: ["成交额", "总销售额", "Gross Merchandise Volume"]
binding:
  asset_type: metric
  asset_name: metric_gmv      # 核心意图：业务术语→指标，强路由绑定
description: "Gross Merchandise Volume，已成交订单的商品总额"
```

```yaml
# 示意：L3 业务规则——Metric + Rule 资产（GMV 怎么算才对）
# 文件：semantic-assets/metrics/metric_gmv.yaml
asset_type: metric
name: metric_gmv
base_table: fact_orders
expression: "SUM(amount)"
filter: "status = 'completed'"   # 核心意图：L3 规则约束——GMV 不含退货/取消订单
dimensions: [product_id, region, biz_date]
rules:
  - type: exclude_status
    values: ["returned", "cancelled"]
    reason: "GMV 仅统计已成交订单"
```

这三份 YAML 经 CI 校验后发布——`term: GMV` 引用的 `metric_gmv` 必须存在（引用完整性），`metric_gmv` 引用的 `fact_orders.amount`/`status` 列必须在 L1 Table 资产中存在（Schema 一致性）。任何一处断裂，CI 阻断发布。

---

## 40.2 资产类型体系与 Git+YAML 选型
### 9 种资产类型

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
 subgraph 资产类型["9 种语义资产类型"]
 A1[表资产 Table<br/>表结构描述]
 A2[列资产 Column<br/>列语义描述]
 A3[指标资产 Metric<br/>指标定义与计算规则]
 A4[Join 资产<br/>表间关联路径]
 A5[术语资产 Term<br/>业务术语映射]
 A6[规则资产 Rule<br/>业务约束规则]
 A7[Few-shot 资产<br/>问答→SQL 示例]
 A8[上下文资产<br/>适用场景描述]
 A9@{ icon: "codicon:lock", form: "rounded", label: 权限资产<br/>数据访问策略, pos: "b", h: 36 }
 end
linkStyle default stroke:#697077,stroke-width:2px
classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
class A1,A2,A3,A4 bpData
class A5,A6,A7,A8,A9 bpInfo
```
<p class="caption" markdown="span">**图 40-3** 种资产类型</p>

除了上面三层示例里的 Table/Term/Metric，Join 和 Few-shot 两类资产对 NL2SQL 尤为关键——前者告诉 LLM 表怎么连，后者告诉 LLM 好的 SQL 长什么样：

```yaml
# 示意：Join 资产（表间关联路径，供 Ch 43 Steiner 树消费）
# 文件：semantic-assets/joins/fact_orders_dim_product.yaml
asset_type: join
left_table: fact_orders
right_table: dim_product
condition: "fact_orders.product_id = dim_product.product_id"
cardinality: many_to_one
cost: 1.0     # 供查询规划器评估 join 代价
```

```yaml
# 示意：Few-shot 资产（问答→SQL 示例，供 Ch 42 System Prompt 注入）
# 文件：semantic-assets/few-shots/gmv_by_region.yaml
asset_type: few_shot
complexity: simple       # simple/medium/complex，决定注入数量
question: "华东区上月的 GMV 是多少？"
bound_terms: [GMV, 华东区, 上月]
sql: |
  SELECT SUM(amount) AS gmv
  FROM fact_orders
  WHERE status = 'completed'
    AND region = 'East China'
    AND biz_date >= dateadd(month, -1, trunc(current_date, 'mon'))
```

### System Prompt 设计

语义资产最终要注入到 LLM 的 System Prompt 里，才能约束 SQL 生成。一个设计良好的 System Prompt 是分层的：角色定义 → 数据库 schema 约束 → 安全规则 → 输出格式，再按查询复杂度分级注入 few-shot 示例，术语绑定强路由优先：

```python
# 示意：System Prompt 模板 + few-shot 分级注入 + 术语强路由
SYSTEM_PROMPT = """你是 Aurora CDP 的 NL2SQL 引擎，只输出 :simple-amazons3: Redshift SQL。
【数据库约束】只能引用语义资产中定义的表/列，禁止臆造。
【安全规则】禁止 DROP/DELETE/TRUNCATE；必须带 LIMIT；PII 列不可 SELECT。
【术语绑定】用户提到 "GMV" → 必须用 metric_gmv 的定义（SUM(amount) WHERE status='completed'）。
【输出格式】仅返回 SQL，无解释。"""

def build_few_shot(query: str, complexity: str) -> str:
    # 核心意图①：术语绑定强路由优先注入（GMV/华东区 等命中即注入对应 few-shot）
    bound = match_terms(query)                              # 命中 GMV → gmv_by_region.yaml
    shots = load_few_shots(terms=bound, complexity=complexity)
    # 核心意图②：按复杂度分级注入数量（simple=2, medium=4, complex=6）
    n = {"simple": 2, "medium": 4, "complex": 6}[complexity]
    return "\n".join(f"问：{s['question']}\nSQL：{s['sql']}" for s in shots[:n])

prompt = f"{SYSTEM_PROMPT}\n\n【示例】\n{build_few_shot(user_query, 'simple')}\n\n【问题】{user_query}"
```

!!! tip "引申"
    System Prompt 的分层设计是"约束 LLM 搜索空间"的关键——角色定义限定输出范围，schema 约束禁止臆造列，术语绑定把"GMV"这种业务术语硬路由到正确指标定义，few-shot 给出"好 SQL 长什么样"的范例。其中**术语绑定强路由**最重要：它让"GMV"不再靠 LLM 猜，而是强制走 L2 术语→L3 规则的确定路径，这是降低幻觉的核心手段（详见 [Ch 43](./43-语义查询规划器-Steiner树与代数改写.md) 的幻觉分类学）。

### 为什么选 Git+YAML 而非数据库

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
 subgraph Git-YAML优势["Git+YAML 的优势"]
 G1[ 版本控制<br/>每次变更有 diff/历史]
 G2@{ icon: "codicon:person", form: "rounded", label:  PR 审查<br/>语义变更需人工 review, pos: "b", h: 36 }
 G3@{ icon: "codicon:shield", form: "rounded", label:  CI 校验<br/>变更前自动校验一致性, pos: "b", h: 36 }
 G4@{ icon: "codicon:history", form: "rounded", label:  审计友好<br/>谁改了什么、何时改的, pos: "b", h: 36 }
 end
linkStyle default stroke:#697077,stroke-width:2px
classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
class G1,G2,G3,G4 bpSuccess
```
<p class="caption" markdown="span">**图 40-4** 为什么选 Git+YAML 而非数据库</p>

| 维度 | Git+YAML | 数据库驱动 |
|---|---|---|
| **版本控制** | ✅ 原生 Git | ❌ 需自建 |
| **审查流程** | ✅ :octicons-git-pull-request-16: PR review | ❌ 直接改库 |
| **CI 校验** | ✅ pre-commit + CI | ❌ 需额外工具 |
| **审计** | ✅ Git log | ❌ 需审计日志 |
| **查询性能** | ❌ 需加载到内存 | ✅ 原生快 |
| **适合场景** | 低频变更+高治理 | 高频变更+低治理 |
<p class="caption" markdown="span">**表 40-2** 为什么选 Git+YAML 而非数据库</p>


!!! warning "Trade-off"
    语义资产变更频率低（不是每次查询都改），但治理要求高（改错了 GMV 定义影响所有查询）。Git+YAML 的版本控制+PR 审查+CI 校验完美匹配这个特征。代价是 YAML 编写成本较高——但这正是"治理"的本意：让变更不容易随意发生。

---

## 40.3 离线发布管线
```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
 subgraph 离线发布["离线发布管线"]
 YAML[Git 仓库<br/>YAML 资产] --> PRE[pre-commit 校验<br/>本地格式/语法检查]
 PRE --> CI[CI 校验<br/>一致性/引用完整性]
 CI --> PR[PR Review<br/>人工审查]
 PR --> MERGE[合并主分支]
 MERGE --> S3[发布到 S3]
 S3 --> SYNC[后端 R/V/G 同步<br/>加载到检索引擎]
 end
linkStyle default stroke:#697077,stroke-width:2px
classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
class YAML bpData
class PRE bpProcess
class CI bpProcess
class PR bpDecision
class MERGE bpProcess
class S3 bpData
class SYNC bpProcess
```
<p class="caption" markdown="span">**图 40-5** 离线发布管线</p>

| 阶段 | 作用 | 阻断级别 |
|---|---|---|
| pre-commit | 本地格式/语法检查 | 警告 |
| CI 校验 | 一致性（引用的表/列是否存在） | 阻断 |
| PR Review | 人工审查业务正确性 | 阻断 |
| 发布 | YAML → S3 → 检索引擎同步 | 自动 |
<p class="caption" markdown="span">**表 40-3** 离线发布管线</p>


### CI 校验内容

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
 subgraph CI校验["CI 校验项"]
 C1[引用完整性<br/>术语引用的指标是否存在]
 C2[Schema 一致性<br/>指标涉及的列是否存在]
 C3[规则一致性<br/>计算规则是否自洽]
 C4[命名规范<br/>命名是否遵循约定]
 end
linkStyle default stroke:#697077,stroke-width:2px
classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
class C1,C2,C3,C4 bpProcess
```
<p class="caption" markdown="span">**图 40-6** CI 校验内容</p>

CI 校验落到代码就是对所有 YAML 跑一遍引用完整性检查——术语引用的指标必须存在、指标引用的列必须在 Table 资产中：

```python
# 示意：CI 一致性校验——引用完整性（term→metric→columns 不断链）
def validate_references(assets):
    tables = {a.name: a for a in assets if a.type == "table"}
    metrics = {a.name: a for a in assets if a.type == "metric"}
    errors = []
    for term in (a for a in assets if a.type == "term"):
        bound = term.binding["asset_name"]                       # L2→L3：术语绑定的指标
        if bound not in metrics:
            errors.append(f"术语 {term.name} 绑定的指标 {bound} 不存在")
    for metric in metrics.values():
        if metric.base_table not in tables:                      # L3→L1：指标的基表必须存在
            errors.append(f"指标 {metric.name} 的基表 {metric.base_table} 不存在")
        table = tables[metric.base_table]
        cols = {c["name"] for c in table.columns}
        for col in extract_columns(metric.expression):           # L3→L1：表达式引用的列必须存在
            if col not in cols:
                errors.append(f"指标 {metric.name} 引用了不存在的列 {col}")
    if errors:
        raise CiCheckError("\n".join(errors))                    # 核心意图：任何断链阻断发布
```

!!! tip "引申"
    离线发布管线的设计灵感来自"代码发布"——语义资产像代码一样经历"写→lint→CI→review→merge→deploy"的全流程。这让语义治理从"随意修改"变为"受控变更"，是企业级 AI 系统与"玩具 demo"的本质区别。

---

## 40.4 引申：对比 dbt Semantic Layer / Cube 的语义层设计
```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
 subgraph 三种语义层["三种语义层方案"]
 TTD@{ icon: "codicon:hubot", form: "rounded", label: the-ttd 语义平面<br/>Git+YAML+三层治理<br/>专为 Agentic BI, pos: "b", h: 36 }
 DBT[dbt Semantic Layer<br/>dbt 模型延伸<br/>绑定 dbt 生态]
 CUBE[Cube<br/>独立语义层服务<br/>API 优先]
 end
linkStyle default stroke:#697077,stroke-width:2px
classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
class TTD bpProcess
class DBT,CUBE bpExternal
```
<p class="caption" markdown="span">**图 40-7** 引申：对比 dbt Semantic Layer / Cube ...</p>

| 维度 | the-ttd 语义平面 | dbt Semantic Layer | Cube |
|---|---|---|---|
| **管理方式** | Git + YAML | dbt YAML（同 repo） | JS/Schema 文件 |
| **治理层级** | 三层（元数据/术语/规则） | 两层（metrics/dimensions） | 两层（cubes/dimensions） |
| **发布方式** | 离线 CI + PR | dbt build | Cube Server |
| **查询接口** | R/V/G/D 四引擎 | MetricFlow API | REST/GraphQL API |
| **生态绑定** | 无（全栈自建） | dbt | 独立 |
| **适合场景** | Agentic BI 深度定制 | dbt 用户 | 通用语义层 |
<p class="caption" markdown="span">**表 40-4** 引申：对比 dbt Semantic Layer / Cube 的语义层设计</p>


!!! tip "引申"
    dbt Semantic Layer 和 Cube 都是优秀的语义层方案，但它们主要为"BI 工具"设计——把指标定义统一，让 BI 工具查询一致。而 the-ttd 的语义平面专为"AI Agent"设计——除了指标定义，还有术语治理（L2）和业务规则（L3），这些是 AI 理解业务上下文所必需的。这是"BI 语义层"和"AI 语义层"的区别。

---

## :material-check-circle: 本章小结
- 三层治理：L1 元数据契约（表/列/指标/join 结构，YAML 示例）→ L2 术语治理（业务术语→技术映射）→ L3 业务规则（计算规则/约束），三层相互引用、CI 校验不断链
- 9 种语义资产类型：表/列/指标/join/术语/规则/few-shot/上下文/权限，Join 供 Steiner 树消费、Few-shot 供 System Prompt 注入
- System Prompt 分层设计：角色定义→schema 约束→安全规则→输出格式，few-shot 按复杂度分级注入，术语绑定强路由优先——降低幻觉的核心手段
- Git+YAML 选型理由：版本控制+PR 审查+CI 校验+审计——匹配"低频变更+高治理"特征
- 离线发布管线：pre-commit→CI 校验（引用完整性伪代码）→PR Review→发布 S3→R/V/G 同步——语义资产像代码一样受控发布
- 对比 dbt/Cube：the-ttd 语义平面专为 AI Agent 设计（三层+术语+规则），dbt/Cube 主要为 BI 工具设计

---

!!! quote "下一章"
    [Ch 41 R/V/G/D 四引擎 RAG 检索](./41-RVGD四引擎RAG检索.md) —— 语义资产发布好了，AI 怎么检索它们？接下来看四引擎 RAG 设计。

