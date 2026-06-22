# Ch 8 数据仓库设计（Redshift）

!!! info "面包屑"
    [本书主页](./index.md) › [Part II 架构设计](./07-数据湖分层设计.md) › Ch 8

!!! abstract "项目第 0-1 年 · 架构设计期→核心建设期——数仓奠基"

---

## :material-school: 本章你将学到
- Redshift 集群架构与 Spectrum 外部表的设计
- 分层 schema 设计与 Kimball 维度建模在平台中的应用
- Redshift 行级安全（RLS）与列级安全（CLS）策略——数据仓库的安全基石
- Redshift vs :simple-snowflake: Snowflake vs BigQuery 的工程取舍

---

数据湖解决了"存储"问题（[Ch 7](./07-数据湖分层设计.md)），但"分析查询"需要数据仓库。在数据湖上用 Athena 做 ad-hoc 查询可以，但 BI 报表的高频复杂查询、多表 join 和聚合计算，还是需要一个真正的列式 MPP 数据仓库。

选 Redshift 的过程在 [Ch 2](./02-从需求到蓝图：一个数据平台的诞生.md) 已经讲过——四年前 Snowflake 未入华，Redshift 是 AWS China 上唯一靠谱的云数仓选项。但"选了 Redshift"只是开始，怎么用好它才是真正的工程挑战。

我在企业征信项目里用过 :simple-postgresql: PostgreSQL 做数仓——能跑，但数据量到 TB 级后查询就慢得不可接受。PostgreSQL 是行式 OLTP 数据库，不适合大规模分析查询；Redshift 是列式 MPP（大规模并行处理）数据库，天然为分析场景设计。这个"行式 vs 列式"、"单机 vs MPP"的差别，是数仓设计的底层认知。

---

## 8.1 Redshift 集群架构与 Spectrum 外部表

### 集群架构

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
    subgraph Redshift集群["Redshift 集群"]
        LEADER@{ icon: "logos:aws-redshift", form: "rounded", label: "Leader Node<br/>查询规划与分发", pos: "b", h: 44 }
        CN1[Compute Node 1<br/>数据存储+计算]
        CN2[Compute Node 2]
        CN3[Compute Node 3]
        CN4[Compute Node 4]
    end

    CLIENT@{ icon: "codicon:person", form: "rounded", label: "BI / DaaS / 分析师", pos: "b", h: 40 } -->|SQL| LEADER
    LEADER --> CN1 & CN2 & CN3 & CN4

    CN1 -.->|Spectrum 查询| S3@{ icon: "logos:aws-s3", form: "rounded", label: "S3 数据湖", pos: "b", h: 40 }
    CN2 -.->|Spectrum 查询| S3

classDef bpProcess  fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData     fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616

class LEADER bpProcess
class CN1,CN2,CN3,CN4 bpProcess
class CLIENT bpExternal
class S3 bpData

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 8-1** 集群架构</p>

Redshift 采用 **MPP（大规模并行处理）架构**：Leader Node 负责接收 SQL、生成执行计划并分发到 Compute Nodes；Compute Nodes 各自存储部分数据并并行执行。平台使用 RA3 节点类型——计算与存储分离架构，数据可缓存在本地 SSD，大量数据留在 S3。

选 RA3 而非 DC2，是我和企业征信教训对比后做的决策。企业征信时用 DC2（计算存储耦合）节点——数据全在本地 SSD，查询快，但扩容时要"加节点+重新分配数据"，停机维护半天。到 Aurora 我选 RA3（计算存储分离）——数据主要在 S3，本地 SSD 只做缓存，扩容时"加节点即可"，数据不用重分配，几分钟完成。这个差异在第二年业务域从 3 个涨到 6 个时兑现了价值：有次 BI 查询高峰导致集群负载告警，我加了 2 个 RA3 节点，5 分钟生效，全程无停机——如果用 DC2，同样的扩容要停机半天重分配数据。**计算存储分离不是理论优势，是"在线扩容"的实操能力**。

RA3 还有一个隐性好处——它和 Spectrum（下节）天然配合。RA3 的数据本就在 S3，Spectrum 查 S3 外部表时，数据不用"搬运"，直接在 S3 上扫描。这让"本地表+外部表混合查询"的性能损耗降到最低。如果用 DC2，数据在本地 SSD，查外部表要从 S3 拉数据，跨存储层延迟显著。**节点选型和数据湖集成是联动的决策，不能割裂考虑**。

### Spectrum：数据湖的"外部表"

Redshift Spectrum 让 Redshift 可以**直接查询 S3 数据湖中的数据**，无需先 COPY 入仓：

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
    subgraph 数据湖["S3 数据湖"]
        RAW[Raw 层 Parquet]
        ENR[Enriched 层 Parquet]
    end

    subgraph Redshift["Redshift"]
        EXT[外部 Schema<br/>Spectrum 外部表]
        LOCAL[本地 Schema<br/>已 COPY 入仓的表]
        RS_QUERY[SQL 查询引擎]
    end

    RAW -->|外部表映射| EXT
    ENR -->|外部表映射| EXT
    EXT --> RS_QUERY
    LOCAL --> RS_QUERY

classDef bpProcess  fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData     fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616

class RAW,ENR bpData
class EXT bpProcess
class LOCAL bpData
class RS_QUERY bpProcess

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 8-2** Spectrum：数据湖的"外部表"</p>

| 查询方式 | 数据位置 | 适合场景 |
|---|---|---|
| **本地表** | Redshift 内部存储 | 高频查询、复杂 join、性能敏感 |
| **Spectrum 外部表** | S3 数据湖 | 低频查询、探索性分析、避免重复存储 |
<p class="caption" markdown="span">**表 8-1** Spectrum：数据湖的"外部表"</p>

"Spectrum 外部表 vs COPY 入仓"的决策，我在项目第一年定了一个简单规则：**高频查询的表 COPY 入仓，低频或大体量的表用 Spectrum**。这个规则看起来简单，但判断"高频低频"需要数据——我在 Redshift 的 `stl_query` 系统表里跑了一个查询统计，发现 80% 的查询集中在 20% 的表上（经典的二八定律）。那 20% 的表 COPY 入仓（本地表，查询快），剩下 80% 用 Spectrum（省存储，按需查）。这个"按查询频率分流"的策略让存储成本降了约 40%，高频查询性能不受影响。

但 Spectrum 有一个我在初期低估的坑——**它按扫描量计费**。有一次分析师写了个 `SELECT *` 查了张 500GB 的外部表，单次查询费用几百块。从那以后我定了规则：外部表查询必须带分区过滤（`WHERE date >= ...`），并在 BI 工具层做了 SQL 审查拦截全表扫描。**Spectrum 的"按需查询"是双刃剑——灵活但容易失控，必须有成本护栏**（呼应 [附录 G FinOps](./appendix-G-FinOps成本治理.md)）。

!!! tip "引申"
    Spectrum 的价值是"按需查询数据湖而不必全量入仓"。比如某个历史归档表很大但很少查，放本地浪费存储，放 S3 用 Spectrum 按需查更经济。这是"湖仓一体"的雏形——数据湖和数据仓库通过外部表打通。

---

## 8.2 模式设计：分层 schema 与 Kimball 维度建模

### Schema 分层

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
    subgraph Redshift_Schema分层["Redshift Schema 分层"]
        META[metadata schema<br/>运行元数据：审计日志/加载历史/变更日志]
        STAGE[etl_stage schema<br/>暂存表：从 S3 COPY 的原始暂存]
        SPECTRUM[外部 schema<br/>Spectrum 映射数据湖]
        ENR[enriched_* schema<br/>加工后的维度/事实表]
    end

    S3[S3 Enriched] -->|COPY| STAGE
    STAGE -->|加工| ENR
    S3 -.->|外部表| SPECTRUM
    ENR -->|记录| META

classDef bpProcess  fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData     fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpSuccess  fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpInfo     fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616

class META bpInfo
class STAGE bpProcess
class SPECTRUM bpData
class ENR bpSuccess
class S3 bpData

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 8-3** Schema 分层</p>

| Schema | 职责 | 谁写入 | 谁读取 |
|---|---|---|---|
| `metadata` | 运行元数据（审计/加载历史/DDL 变更） | ETL 框架自动 | 运维/排障/合规 |
| `etl_stage` | 暂存表（从 S3 COPY 的中间态） | ETL 框架 | 下游加工步骤 |
| 外部 schema | Spectrum 映射 S3 数据湖 | 数据目录 | 探索性查询 |
| `enriched_*` | 各业务域的维度/事实表 | ETL 框架 | BI/DaaS/AI |
<p class="caption" markdown="span">**表 8-2** Schema 分层</p>

这四层 schema 的划分，是我在企业征信"单 schema 大杂烩"教训基础上设计的。企业征信时所有表都在一个 `public` schema 里——ETL 暂存表、维度事实表、审计日志表全混在一起。后果是：BI 工具连上来看到几百张表，分不清哪些是"分析就绪"哪些是"中间垃圾"；更糟的是，有个分析师误查了 ETL 暂存表，拿到的数据是半加工的，报表数字错了两天才发现。到 Aurora 我把 schema 分成四层，核心目的是**让"表的状态"一目了然**——`etl_stage` 是"加工中，别碰"，`enriched_*` 是"加工完，可用"，`metadata` 是"元数据，运维用"，外部 schema 是"数据湖探索"。BI 工具只授权访问 `enriched_*`，从权限层杜绝了"误查暂存表"。

`metadata` schema 单独列出是我特别想强调的设计。很多团队的数仓没有独立的元数据 schema——审计日志、加载历史、DDL 变更散落各处或根本没记。我在企业征信时也犯过这个错，结果排障时"不知道这张表什么时候被谁改过"，全靠猜。到 Aurora 我把 `metadata` 作为一等 schema，ETL 框架自动记录每次加载的批次、行数、耗时、状态——这个设计后来在 GxP 审计时被审计员评为"数据完整性可追溯性优秀"。**元数据不是事后补的日志，是数仓的一等公民**（M10 合规嵌入）。

### Kimball 维度建模

`enriched_*` schema 内部采用 **Kimball 维度建模**：

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
erDiagram
    DIM_HOSPITAL ||--o{ FACT_PRESCRIPTION : "医院维度"
    DIM_DOCTOR ||--o{ FACT_PRESCRIPTION : "医生维度"
    DIM_PRODUCT ||--o{ FACT_PRESCRIPTION : "产品维度"
    DIM_DATE ||--o{ FACT_PRESCRIPTION : "日期维度"

    DIM_HOSPITAL {
        string hospital_key PK
        string hospital_name
        string region
        string tier
    }
    FACT_PRESCRIPTION {
        string prescription_key PK
        string hospital_key FK
        string doctor_key FK
        string product_key FK
        date date_key FK
        int quantity
        decimal amount
    }
```
<p class="caption" markdown="span">**图 8-4** Kimball 维度建模</p>

| 表类型 | 作用 | 特征 |
|---|---|---|
| **维度表（Dimension）** | 描述业务实体 | 宽表、变化慢、用于过滤和分组 |
| **事实表（Fact）** | 记录业务事件 | 窄表、增长快、包含度量值和外键 |
<p class="caption" markdown="span">**表 8-3** Kimball 维度建模</p>

选 Kimball 而非 Data Vault 或 Inmon，是我在项目第一周和团队争论后拍板的。Data Vault 的拥护者认为它"更适合大规模集成、变更管理好"——这理论上成立，但有个代价：Data Vault 的查询性能差，需要在上面再建一层星型模型供 BI 查询——等于建了两层模型（Vault + Mart），工作量翻倍。对于 Aurora 这个规模（20000+ 表但分析查询为主），Kimball 的"一层星型模型直接服务 BI"更务实——建模成本是 Data Vault 的一半，查询性能更好。

但我要诚实地说 Kimball 的痛点——**SCD（缓慢变化维）管理**。医院的级别从"三甲"变成"三甲+专科"时，是覆盖旧值（SCD1）还是保留历史（SCD2）？SCD2 要加 `effective_from/effective_to` 字段，维度表行数膨胀，BI 查询要带时间条件——复杂度不低。我在第一年低估了这个复杂度，导致第二年初医院维度改了三次级别，SCD2 逻辑写错了，报表"历史某时间点的医院级别"全错。花了三天修。**Kimball 的代价不在"建模型"，而在"管变化"**——如果数据域维度变化频繁，SCD 管理成本会吃掉 Kimball 的性能优势。这是选型时要权衡的。

!!! warning "Trade-off"
    Kimball 维度建模是数据仓库的经典方法论，优势是查询性能好、业务理解直观。代价是维度变更管理复杂（SCD 类型 1/2/3 的选择）和建模成本高。另一种选择是 Data Vault——更适合大规模集成但查询性能差，需要再建一层星型模型供查询。对于以分析查询为主的场景，Kimball 仍是务实选择——但要做好 SCD 管理的心理准备。

---

## 8.3 Redshift 行级安全（RLS）与列级安全（CLS）策略

这是数据仓库安全设计的核心。Redshift 提供两种细粒度安全策略，平台将其作为数据治理的基石。

!!! tip "引申：数据库安全的发展脉络"
    数据库安全经历了从粗到细的演进：最早只有"库级权限"（能/不能访问这个库）→ "表级权限"（能/不能访问这张表）→ "行级安全 RLS"（能访问表，但只看到特定行）→ "列级安全 CLS"（能访问行，但特定列不可见）→ "单元格级安全"（行×列交叉控制）。每一代都在前一代基础上增加粒度。Redshift 同时支持 RLS 和 CLS，这让平台能在不改变查询 SQL 的前提下实现细粒度数据隔离——用户写 `SELECT * FROM fact_prescription`，RLS 自动加 `WHERE region='华东'`，CLS 自动隐藏 `patient_id_card` 列。用户无感，但数据安全了。这种"声明式安全"是现代数仓区别于传统数仓的重要能力。

### RLS（Row-Level Security）：行级安全

RLS 控制**谁能看到哪些行**。例如：华东区销售只能看到华东区的处方数据。

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TD
    USER[用户登录<br/>角色=华东销售] --> QUERY[查询 FACT_PRESCRIPTION]
    QUERY --> RLS[RLS 策略引擎]
    RLS -->|自动注入过滤| FILTER[WHERE region = '华东']
    FILTER --> RESULT[仅返回华东区数据]

classDef bpProcess  fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess  fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo     fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616

class USER bpExternal
class QUERY bpProcess
class RLS bpDecision
class FILTER bpInfo
class RESULT bpSuccess

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 8-5** RLS（Row-Level Security）：行级安全</p>

RLS 策略绑定到角色（Role），查询时**自动注入行级过滤条件**，用户无需（也无法）手动绕过。

选 RLS 而非"应用层过滤"，是我在企业征信教训基础上做的决策。企业征信时数据隔离靠应用层——BI 工具查询时拼接 `WHERE region=?`，参数由应用传入。问题有三个：一是**不可靠**——开发者忘了拼 WHERE，或拼错了，数据就泄露了；二是**难审计**——安全审计员要检查"每个查询是否正确过滤"，但过滤逻辑散落在各应用里，没法统一审计；三是**重复**——每个应用都要实现一遍过滤逻辑，维护成本高。到 Aurora 我选 RLS——过滤逻辑绑定在数据库层，应用层只管发 `SELECT *`，数据库自动注入过滤。**安全责任从"每个应用开发者"收敛到"数据库管理员"**——一处配置，全局生效，可审计。

RLS 还有一个我在第四年才意识到的战略价值——**它是 Agentic BI 的安全基石**。当 AI Agent 代用户查询数仓时（见 [Ch 46 数据平面与 CDP 整合](./46-数据平面与CDP整合.md)），Agent 用的数据库角色继承用户的 RLS 策略——华东用户的 Agent 只能查华东数据，即使 Agent 的 SQL 没带区域过滤，RLS 也会兜底。如果当时选了应用层过滤，Agent 时代就要重新给每条 SQL 拼过滤——而 RLS 让"安全策略"与"查询方式"解耦，AI 来了也不用改。**好的安全设计是面向未来的——它不预测未来用什么查询，但保证任何查询都安全**（M10 合规嵌入的长期回报）。

**典型应用**：

| 场景 | RLS 策略 |
|---|---|
| 区域隔离 | 华东销售只能看华东数据 |
| 业务域隔离 | SCI 团队只能看 SCI 域数据 |
| 租户隔离（AI 场景） | 不同租户的 Agent 只能查自己租户的数据 |
<p class="caption" markdown="span">**表 8-4** RLS（Row-Level Security）：行级安全</p>


### CLS（Column-Level Security）：列级安全

CLS 控制**谁能看到哪些列**。例如：普通分析师能看到处方数量但不能看到患者身份证号。

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
    subgraph FACT_PRESCRIPTION表["FACT_PRESCRIPTION 表"]
        C1[处方编号<br/>所有人可见]
        C2[医院名称<br/>所有人可见]
        C3[处方数量<br/>所有人可见]
        C4[患者身份证<br/>仅合规角色可见]
        C5[患者姓名<br/>仅合规角色可见]
    end

    ANALYST@{ icon: "codicon:person", form: "rounded", label: "普通分析师", pos: "b", h: 40 } --> C1 & C2 & C3
    COMPLIANCE@{ icon: "codicon:shield", form: "rounded", label: "合规角色", pos: "b", h: 40 } --> C1 & C2 & C3 & C4 & C5

classDef bpSuccess  fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError    fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616

class C1,C2,C3 bpSuccess
class C4,C5 bpError
class ANALYST bpExternal
class COMPLIANCE bpExternal

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 8-6** CLS（Column-Level Security）：列级安全</p>

CLS 通过列级 GRANT 实现：对敏感列只授予特定角色，其他角色查询时会报权限错误（或看不到该列）。

CLS 的设计驱动力是 PIPL 的"最小必要"原则——分析师查处方数据时，需要看"处方数量、医院、产品"来做销售分析，但**不需要**看"患者身份证、患者姓名"。如果用视图（View）实现，要为每个角色建一个视图，视图数量爆炸（N 个表 × M 个角色 = N×M 个视图）。CLS 让我直接在表上做列级 GRANT——一个角色一个 GRANT 语句，不用建视图。**CLS 是"声明式"的，视图是"命令式"的**——声明式更简洁、更不容易出错。

我在第一年用 CLS 时踩过一个坑——**`SELECT *` 的行为**。普通分析师跑 `SELECT * FROM fact_prescription` 时，因为 `patient_id_card` 列没授权，Redshift 会报权限错误而不是"自动跳过该列"。这导致 BI 工具的 `SELECT *` 查询全挂。解决方案是改 BI 工具的查询为显式列名（`SELECT prescription_id, hospital_name, quantity FROM ...`），只查授权的列。这个调整花了一周——但长期收益是 BI 查询更规范了，不再有 `SELECT *` 的坏习惯。**CLS 倒逼了查询规范化**——这是个意外但正向的副作用。

### RLS + CLS + 脱敏的协同分层

平台构建了**三层纵深防御**：

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
    L1[第一层：RLS<br/>行级——控制能看到哪些行<br/>区域/租户/业务域隔离]
    L2[第二层：CLS<br/>列级——控制能看到哪些列<br/>敏感字段隔离]
    L3[第三层：脱敏 UDF<br/>值级——控制看到的值是什么<br/>mask/加密/哈希]

    L1 --> L2 --> L3
    QUERY[SQL 查询] --> L1

classDef bpProcess  fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpInfo     fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616

class L1 bpInfo
class L2 bpInfo
class L3 bpInfo
class QUERY bpProcess

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 8-7** RLS + CLS + 脱敏的协同分层</p>

| 层 | 粒度 | 防护对象 | 详见 |
|---|---|---|---|
| RLS | 行 | 防止跨区域/租户数据泄露 | 本章 |
| CLS | 列 | 防止敏感字段被未授权访问 | 本章 |
| 脱敏 UDF | 值 | 即使看到字段，值也是脱敏后的 | [Ch 18](./18-数据脱敏与隐私治理.md) |
<p class="caption" markdown="span">**表 8-5** RLS + CLS + 脱敏的协同分层</p>


!!! tip "引申"
    三层防护的关系是"纵深防御"（Defense in Depth）——即使某一层被绕过，其他层仍能兜底。比如 RLS 配置错了导致跨区域可见，CLS 仍能阻止敏感列被访问；CLS 漏配了某列，脱敏 UDF 仍能让值不可读。这是安全架构的核心原则：**不依赖单一防线**。

---

## 8.4 引申：Redshift vs Snowflake vs BigQuery 的工程取舍

| 维度 | Redshift | Snowflake | BigQuery |
|---|---|---|---|
| **架构** | MPP（计算存储分离 RA3） | 原生云数仓（多集群共享存储） | Serverless（无集群概念） |
| **计费** | 按节点小时 | 按仓库大小+使用时长 | 按查询扫描量 |
| **扩展** | 弹性集群（增减节点） | 多虚拟仓库独立扩展 | 自动弹性 |
| **数据湖集成** | Spectrum（外部表） | 外部表 + 原生 :material-database-sync: Iceberg | 外部表 + BigLake |
| **半结构化** | SUPER 类型 | VARIANT 类型（原生） | STRUCT/ARRAY（原生） |
| **RLS/CLS** | ✅ 原生支持 | ✅ 原生支持 | ✅ 原生支持 |
| **中国可用性** | ✅（AWS China） | ✅（已入华） | ❌（GCP China 有限） |
| **运维负担** | 中（需管集群） | 低（高度托管） | 最低（Serverless） |
<p class="caption" markdown="span">**表 8-6** 引申：Redshift vs Snowflake vs BigQuery 的工程取舍</p>


!!! warning "Trade-off"
    四年前选 Redshift 的核心原因是"AWS China 可用 + 与 S3/Glue 生态集成"。如果今天选，Snowflake 在托管体验和半结构化数据处理上更优，且已入华。但 Redshift 的优势是与 AWS 生态深度集成（Spectrum/IAM/Glue 原生协作）+ 成本可控（按节点而非按查询）。两者都是合理选择，取决于团队偏好和生态锁定容忍度。

---

## :material-check-circle: 本章小结
- Redshift 采用 MPP 架构，RA3 节点实现计算存储分离；Spectrum 外部表打通数据湖与数据仓库
- Schema 分四层：metadata（元数据）/ etl_stage（暂存）/ 外部 schema（Spectrum）/ enriched_*（维度建模）
- `enriched_*` 采用 Kimball 维度建模：维度表 + 事实表，查询性能好、业务直观
- 安全基石：RLS（行级）+ CLS（列级）+ 脱敏 UDF（值级）三层纵深防御
- Redshift vs Snowflake vs BigQuery：各有优劣，四年前选 Redshift 是 AWS China 生态约束下的务实选择

---

!!! quote "下一章"
    [Ch 9 计算与 ETL 设计（Glue + Lambda）](./09-计算与ETL设计-Glue与Lambda.md) —— 仓库设计好了，数据怎么加工？接下来看计算层的选型与控制面/数据面分离。

