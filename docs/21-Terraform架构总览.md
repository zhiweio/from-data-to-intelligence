# Ch 21 :simple-terraform: Terraform 架构总览

!!! info "面包屑"
    [本书主页](./index.md) › [Part IV 基础设施与工程效能](./20-元数据管理与数据血缘.md) › Ch 21

!!! abstract "项目第 1 年 · 核心建设期——IaC架构"

---

## :material-school: 本章你将学到
- Terraform 分层与 state 后端设计（S3 + DynamoDB lock）
- core-infra / business / generic-modules 三类仓库的职责
- 模块组装策略与依赖管理（git submodule）

---

## 21.1 Terraform 分层与 state 后端设计

### State 后端

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
 TF@{ icon: "devicon:terraform", form: "rounded", label: "Terraform CLI", pos: "b", h: 40 } -->|读写 state|S3[S3 Bucket<br/>存储 state 文件]
 S3 -.->|并发锁|DDB[DynamoDB Table<br/>state lock]

classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616

class TF bpProcess
class S3,DDB bpData

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 21-1** State 后端</p>

| 设计要点 | 说明 |
|---|---|
| **S3 存 state** | state 文件存 S3，团队共享 |
| **DynamoDB lock** | 防止多人同时 apply 导致 state 损坏 |
| **加密** | state 文件含敏感信息，S3 端 KMS 加密 |
| **版本控制** | S3 版本控制开启，可回滚 state |
<p class="caption" markdown="span">**表 21-1** State 后端</p>


!!! warning "Trade-off"
    Terraform state 含明文敏感信息（如数据库密码），S3 存储需严格 IAM 控制 + KMS 加密。另一种方案是 Terraform Cloud/Enterprise 的远程 state——托管且加密，但引入供应商依赖。本书方案用 S3+DynamoDB 是自托管、零额外成本的选择。

我选 S3+DynamoDB 而非 Terraform Cloud，核心驱动力是"数据驻留"——Terraform Cloud 是 SaaS，state 存在 HashiCorp 的云上，而 Aurora 的合规要求所有数据留在中国境内。S3+DynamoDB 全在 AWS China，满足数据驻留。这个约束比"托管更省心"优先级高——**合规约束永远高于便利性**（M10）。DynamoDB lock 是我在第一年踩过坑才加的：最初没配 lock，两个开发者同时 `terraform apply`，state 文件被并发写入损坏，花了半天从 S3 版本控制回滚。从那以后 lock 成了标配——**state 并发写入是 Terraform 最容易出的灾难性故障**。

### State 隔离

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
 subgraph State隔离["按环境隔离 state"]
 DEV_STATE[DEV state<br/>dev.tfbackend]
 QA_STATE[QA state<br/>qa.tfbackend]
 PROD_STATE[PROD state<br/>prod.tfbackend]
 end

 subgraph 物理隔离["物理隔离"]
 S3_DEV@{ icon: "logos:aws-s3", form: "rounded", label: "S3 key: dev/", pos: "b", h: 40 }
 S3_QA@{ icon: "logos:aws-s3", form: "rounded", label: "S3 key: qa/", pos: "b", h: 40 }
 S3_PROD@{ icon: "logos:aws-s3", form: "rounded", label: "S3 key: prod/", pos: "b", h: 40 }
 end

 DEV_STATE --> S3_DEV
 QA_STATE --> S3_QA
 PROD_STATE --> S3_PROD

classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616

class DEV_STATE,QA_STATE,PROD_STATE bpProcess
class S3_DEV,S3_QA,S3_PROD bpData

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 21-2** State 隔离</p>

按环境隔离 state（dev/qa/prod 各一个 S3 key）是我从企业征信"state 混用"教训学的。企业征信时三个环境共用一个 state 文件，靠 `workspace` 区分——结果有次在 dev 环境 `terraform destroy` 时，误切到了 prod workspace，把 prod 的资源删了。那次事故让我发誓**state 必须物理隔离，不能靠 workspace 逻辑隔离**。到 Aurora 每个 environment 一个独立的 `.tfbackend` 配置文件，指向不同的 S3 key——dev 的 `terraform destroy` 物理上碰不到 prod 的 state。**逻辑隔离靠人记得住，物理隔离靠系统保证**——在 IaC 这种"一行命令就能删资源"的领域，物理隔离是唯一可靠的选择。

---

## 21.2 core-infra / business / generic-modules 三类仓库

这是 [Ch 4](./04-平台五层模型与设计哲学.md) 五层模型在 IaC 层的落地：

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart TB
 subgraph IaC三类仓库["IaC 三类仓库"]
 CORE[core-infra<br/>核心基础资源<br/>L1 层]
 MOD[generic-modules<br/>通用模块库<br/>L2 层]
 BIZ["business-domain-{a..f}<br/>业务 IaC<br/>L3 层"]
 end

 BIZ -->|引用模块|MOD
 BIZ -->|引用 remote state|CORE
 CORE -->|引用模块|MOD

classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616

class CORE,MOD bpProcess
class BIZ bpInfo

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 21-3** core-infra / business / generic-...</p>

| 仓库类型 | 职责 | 变更频率 | 审批级别 |
|---|---|---|---|
| **core-infra** | 全局共享资源（S3/Redshift/IAM/VPC） | 低 | 平台架构组 |
| **generic-modules** | 通用 Terraform 模块 | 中 | 平台架构组 |
| **business-domain-{a..f}** | 业务域资源 | 高 | 业务域团队 |
<p class="caption" markdown="span">**表 21-2** core-infra / business / generic-modules 三类仓库</p>

这三类仓库协作的逻辑是"底层稳定、上层活跃"——core-infra 变更频率最低（共享资源一旦建好很少改），generic-modules 中等（模块迭代但不频繁），business-domain 最高（每天有业务需求变更）。频率分层直接决定了审批级别：core-infra 改动要平台架构组审批（影响全平台），business-domain 改动业务域团队自主（只影响自己域）。**IaC 分层不只是代码组织，更是变更治理的分层**——让高频变更在低风险层发生，低频变更在高风险层受控（M2 分层架构在 IaC 治理的落地）。

我在项目第一年统计过这三类仓库的变更频率：core-infra 每月约 2 次（加资源/改配置），generic-modules 每月约 5 次（模块优化），business-domain 每月约 50 次（新数据源/改字段）。如果三类仓库混在一起（企业征信时的做法），50 次业务变更和 2 次核心变更混在一起，核心变更的审批会被业务变更淹没——"core-infra 改了个 IAM 策略，排在 30 个业务 PR 后面等审批"。分开后各走各的 CI/审批流，互不阻塞。**仓库分层是变更治理的物理隔离**。

---

## 21.3 模块组装策略与依赖管理

### Git Submodule 模式

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
 BIZ[business-domain-a 仓库] -->|git submodule|MOD[generic-modules 仓库]
 BIZ -->|remote state|CORE[core-infra state]

classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616

class MOD bpProcess
class BIZ bpInfo
class CORE bpProcess

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 21-4** Git Submodule 模式</p>

业务仓通过 **git submodule** 引用 generic-modules 仓库，实现模块复用：

| 设计要点 | 说明 |
|---|---|
| **submodule 固定版本** | 每个业务仓锁定 generic-modules 的特定 commit |
| **升级可控** | 模块升级 = 更新 submodule 指针 + 测试 |
| **独立 CI** | 模块变更不自动影响业务仓（需业务仓主动升级） |
<p class="caption" markdown="span">**表 21-3** Git Submodule 模式</p>


!!! tip "引申"
    git submodule 的替代方案是 Terraform Registry / Module Registry——模块发布到 Registry，业务仓通过 `source` 和 `version` 引用。Registry 方式版本管理更规范，但需要自建私有 Registry 或使用 Terraform Cloud。submodule 方式零额外基础设施，适合初期。

    我选 submodule 而非 Registry，是因为项目初期不想引入额外基础设施。submodule 的代价是"升级要手动更新指针"——generic-modules 发了新版本，每个业务仓要主动 `git submodule update`。这在 6 个业务仓时还好，到 15 个仓时升级一次模块要改 15 个仓的指针——很烦。但相比自建 Registry 的运维成本，submodule 的"烦"是可以接受的。**技术选型要匹配团队规模——15 个仓的"烦"不值得引入 Registry，50 个仓就值得了**。

### Remote State 引用

业务仓通过 `terraform_remote_state` data source 引用 core-infra 的输出：

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
 CORE[core-infra<br/>output: s3_landing_bucket_arn] -->|remote_state data|BIZ[business-domain-a<br/>引用 bucket arn]

classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616

class CORE bpProcess
class BIZ bpInfo

linkStyle default stroke:#697077,stroke-width:2px
```
<p class="caption" markdown="span">**图 21-5** Remote State 引用</p>

这让"共享资源的唯一定义权"归属 core-infra，业务仓只消费不创建。

remote state 引用的设计价值是**避免资源重复定义**。S3 数据湖桶在 core-infra 创建一次，业务仓通过 `terraform_remote_state` 读取它的 ARN，而不是各自再创建。我在企业征信时犯过"重复定义"的错——三个业务仓各自用 Terraform 创建了"同一个" S3 桶（名字相同），结果 Terraform state 冲突，三个仓互相覆盖，最终桶的配置被改得面目全非。到 Aurora 我用 remote state 杜绝了这个问题——**共享资源只能有一个定义者，其他仓只能引用不能创建**。这是 IaC 治理的铁律，和 [Ch 4](./04-平台五层模型与设计哲学.md) 的"依赖只能向下"一脉相承。

---

## :material-check-circle: 本章小结
- State 后端：S3 存储 + DynamoDB lock，按环境隔离 state，KMS 加密
- IaC 三类仓库：core-infra（L1 共享资源）/ generic-modules（L2 通用模块）/ business-domain（L3 业务 IaC）
- 模块组装用 git submodule（固定版本、升级可控）；共享资源通过 remote state 引用（唯一定义权在 core-infra）

---

!!! quote "下一章"
    [Ch 22 核心基础设施仓库设计](./22-核心基础设施仓库设计.md) —— 接下来深入 core-infra 仓库的具体设计。

