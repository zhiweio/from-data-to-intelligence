# Ch 41 R/V/G/D 四引擎 RAG 检索
!!! info "面包屑"
    [本书主页](./index.md) › [Part VII Data+AI 转型](./40-语义平面-三层治理与Git-YAML.md) › Ch 41

!!! abstract "项目第 4 年 · Data+AI转型期——四引擎RAG"

---

## :material-school: 本章你将学到
- 四引擎 RAG：R（关系精确）/ V（向量语义）/ G（图遍历）/ D（动态 few-shot）
- 术语绑定强路由：业务术语全链路传播
- Corrective-RAG 回退与重排
- Naive→Advanced→Modular RAG 演进谱系

---

## 41.1 四引擎 RAG：R/V/G/D
```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
 QUERY@{ icon: "codicon:comment", form: "rounded", label: "用户问题", pos: "b", h: 40 } --> PARALLEL[并行检索]

 PARALLEL --> R@{ icon: "codicon:database", form: "rounded", label: "Engine R 关系精确<br/>结构化查询语义资产<br/>表/列/指标精确匹配", pos: "b", h: 40 }
 PARALLEL --> V@{ icon: "codicon:search", form: "rounded", label: "Engine V 向量语义<br/>pgvector 向量相似度<br/>模糊语义匹配", pos: "b", h: 40 }
 PARALLEL --> G@{ icon: "codicon:graph", form: "rounded", label: "Engine G 图遍历<br/>Apache AGE Cypher<br/>表间关系路径", pos: "b", h: 40 }
 PARALLEL --> D@{ icon: "codicon:references", form: "rounded", label: "Engine D 动态 few-shot<br/>历史问答→SQL 示例<br/>自学习积累", pos: "b", h: 40 }

 R --> MERGE[结果合并+重排]
 V --> MERGE
 G --> MERGE
 D --> MERGE
 MERGE --> CONTEXT@{ icon: "codicon:sparkle", form: "rounded", label: "检索上下文<br/>供 SQL 生成", pos: "b", h: 40 }

 classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
 classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
 classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
 class QUERY bpInfo
 class PARALLEL bpProcess
 class R,V,G,D bpProcess
 class MERGE bpProcess
 class CONTEXT bpData
 linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 41-1** 四引擎 RAG：R/V/G/D</p>

| 引擎 | 检索方式 | 解决的问题 | 技术 |
|---|---|---|---|
| **R（关系精确）** | 结构化查询语义资产表 | 精确匹配表/列/指标 | 关系型查询 |
| **V（向量语义）** | 向量相似度搜索 | 模糊语义匹配（"销量"≈"处方量"） | pgvector |
| **G（图遍历）** | 图查询表间关系 | join 路径发现 | Apache AGE + Cypher |
| **D（动态 few-shot）** | 检索历史问答示例 | 类似问题的 SQL 参考 | 向量检索 + 自积累 |
<p class="caption" markdown="span">**表 41-1** 四引擎 RAG：R/V/G/D</p>


### 为什么需要四引擎而非单一向量检索

!!! warning "Trade-off"
    单一向量检索（V）是大多数 RAG 系统的默认选择，但在 NL2SQL 场景不够：
    - V 擅长"语义相似"但不擅长"精确匹配"——用户问"GMV"时，V 可能返回"销售额"而非精确的 GMV 指标定义
    - V 不擅长"关系推理"——"哪些表能 join"需要图遍历（G）
    - V 不擅长"示例学习"——"类似问题之前怎么解的"需要 few-shot（D）

    四引擎互补：R 保证精确性，V 保证灵活性，G 保证关系推理，D 保证经验复用。

---

## 41.2 术语绑定强路由：业务术语全链路传播
```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
 TERM[“用户提到”GMV””] --> BIND[术语绑定<br/>GMV → metric_gmv]
 BIND --> PROPAGATE[全链路传播]

 PROPAGATE --> R[R 引擎精确查 metric_gmv 定义]
 PROPAGATE --> V[V 引擎限定向量搜索范围]
 PROPAGATE --> G[G 引擎查找 metric_gmv 涉及的表]
 PROPAGATE --> GEN[SQL 生成时强制使用 metric_gmv 定义]
 PROPAGATE --> GUARD[护栏校验术语一致性]

 classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
 classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
 classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
 classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
 classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
 classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
 classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
 classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
 class TERM bpInfo
 class BIND bpProcess
 class PROPAGATE bpProcess
 class R bpProcess
 class V bpProcess
 class G bpProcess
 class GEN bpProcess
 class GUARD bpProcess
 linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 41-2** 术语绑定强路由：业务术语全链路传播</p>

### 术语绑定的价值

| 场景 | 无术语绑定 | 有术语绑定 |
|---|---|---|
| 用户问"GMV 趋势" | LLM 可能猜错 GMV 定义 | 强制使用 metric_gmv 的精确定义 |
| 用户问"华东 GMV" | 可能 join 错区域表 | G 引擎沿 metric_gmv 的表路径找区域维度 |
| 生成 SQL 后 | 护栏不知道"GMV"该用什么 | 护栏校验 SQL 中的 GMV 计算是否符合定义 |
<p class="caption" markdown="span">**表 41-2** 术语绑定的价值</p>


!!! tip "引申"
    术语绑定强路由是 the-ttd 区别于"普通 RAG"的关键创新。普通 RAG 是"检索完就完了"，LLM 可能忽略检索结果；术语绑定是"检索结果强制注入全链路"——从检索到生成到护栏，GMV 这个术语始终绑定到 metric_gmv，不会被 LLM "自由发挥"。

---

## 41.3 Corrective-RAG 回退与重排
```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TD
 RETRIEVE[检索结果] --> EVAL{评估检索质量}
 EVAL -->|高质量|USE[直接使用]
 EVAL -->|低质量|CRAG[Corrective-RAG<br/>回退策略]
 CRAG --> WEB[Web 搜索补充<br/>或扩大检索范围]
 CRAG --> REGEN[重新检索+重排]
 REGEN --> USE2[使用修正后结果]

 classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
 classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
 classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
 classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
 classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
 classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
 classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
 classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
 class RETRIEVE bpProcess
 class EVAL bpDecision
 class USE bpSuccess
 class CRAG bpProcess
 class WEB bpExternal
 class REGEN bpProcess
 class USE2 bpSuccess
 linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 41-3** Corrective-RAG 回退与重排</p>

| 检索质量 | 策略 |
|---|---|
| 高（相关度分数高） | 直接使用 |
| 中（部分相关） | 重排后使用 |
| 低（不相关） | CRAG 回退：扩大范围/补充检索 |
<p class="caption" markdown="span">**表 41-3** Corrective-RAG 回退与重排</p>


---

## 41.4 引申：Naive→Advanced→Modular RAG 演进谱系
```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
 subgraph RAG演进["RAG 演进三阶段"]
 N@{ icon: "codicon:search", form: "rounded", label: Naive RAG<br/>单次检索→生成<br/>简单但效果差, pos: "b", h: 36 }
 A@{ icon: "codicon:search", form: "rounded", label: Advanced RAG<br/>检索前优化+检索后重排<br/>改善质量, pos: "b", h: 36 }
 M@{ icon: "codicon:refresh", form: "rounded", label: Modular RAG<br/>多引擎+回退+自愈<br/>the-ttd 方案, pos: "b", h: 36 }
 end

 N --> A --> M

 classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
 classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
 classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
 classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
 classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
 classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
 classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
 classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
 class N bpProcess
 class A bpProcess
 class M bpSuccess
 linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 41-4** 引申：Naive→Advanced→Modular RAG 演进谱系</p>

| 阶段 | 特征 | 代表 |
|---|---|---|
| Naive | 单次向量检索→生成 | 早期 ChatGPT 插件 |
| Advanced | 检索前优化（查询改写）+检索后重排 | :simple-langchain: LangChain RAG |
| **Modular** | **多引擎并行+CRAG 回退+术语绑定** | **the-ttd** |
<p class="caption" markdown="span">**表 41-4** 引申：Naive→Advanced→Modular RAG 演进谱系</p>


!!! tip "引申"
    RAG 的演进方向是"从单引擎到多引擎、从一次性到自适应"。the-ttd 的四引擎 + CRAG + 术语绑定属于 Modular RAG——它不是"检索一次就交给 LLM"，而是"多角度检索+质量评估+回退修正"。这是企业级 RAG 与"demo RAG"的区别。

---

## :material-check-circle: 本章小结
- 四引擎 RAG：R（关系精确）/ V（向量语义）/ G（图遍历）/ D（动态 few-shot）——互补解决精确性/灵活性/关系推理/经验复用
- 术语绑定强路由：业务术语（如 GMV）→ 绑定技术资产（metric_gmv）→ 全链路传播（检索/生成/护栏）
- Corrective-RAG：检索质量低时回退扩大范围+重排——自适应修正
- RAG 演进：Naive（单次检索）→ Advanced（优化+重排）→ Modular（多引擎+回退+术语绑定）——the-ttd 属于 Modular

---

!!! quote "下一章"
    [Ch 42 Agent 编排：LangGraph 与状态机](./42-Agent编排-LangGraph与状态机.md) —— 检索完了，接下来看 Agent 怎么编排这些步骤。

