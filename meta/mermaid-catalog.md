# Mermaid 图表速查表

!!! warning "内部文档"
    本文档为书籍 Mermaid 图表的索引与速查表，由脚本自动生成，**不展示在站点导航中**。每次修改书籍 Mermaid 图表时应同步更新本文档。

---

## 统计总览

全书共 **352** 个 Mermaid 图表，分布在 **56** 个章节中。

| 图表类型 | 数量 | 占比 |
|---------|------|
| `flowchart LR` | 136 | 38.6% |
| `flowchart TB` | 117 | 33.2% |
| `flowchart TD` | 45 | 12.8% |
| `mindmap` | 11 | 3.1% |
| `sequenceDiagram` | 14 | 4.0% |
| `timeline` | 7 | 2.0% |
| `quadrantChart` | 4 | 1.1% |
| `stateDiagram-v2` | 4 | 1.1% |
| `erDiagram` | 3 | 0.9% |
| `C4Context` | 2 | 0.6% |
| `flowchart` | 2 | 0.6% |
| `C4Container` | 2 | 0.6% |
| `gantt` | 2 | 0.6% |
| `C4Component` | 1 | 0.3% |
| `C4Dynamic` | 1 | 0.3% |
| `classDiagram` | 1 | 0.3% |

---

## 前言

> 1 章 | 2 个图表

### Ch 0: 前言

**图表数量**: 2

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 0-1**| `timeline` | 第三段：医药 CDP——集大成与 Data+AI 转型 |
| **图 0-2**| `flowchart TD` | 0.4 如何阅读：四条阅读路径 |

## Part I 起点

> 3 章 | 14 个图表

### Ch 1: 数字化转型下的医药数据困局

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 1-1**| `flowchart TD` | 1.1 医药行业的"数据孤岛群岛" |
| **图 1-2**| `flowchart TD` | 医药数据的五大业务域 |
| **图 1-3**| `flowchart LR` | 上游系统全景 |
| **图 1-4**| `flowchart TB` | 传统 DWH vs CDP 的能力边界 |
| **图 1-5**| `flowchart LR` | 平台规模速查表 |
| **图 1-6**| `quadrantChart` | 主流企业数据平台方案地图 |

### Ch 2: 从需求到蓝图：一个数据平台的诞生

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 2-1**| `flowchart TD` | 三种交付模式对比 |
| **图 2-2**| `mindmap` | 平台做什么 |
| **图 2-3**| `flowchart TD` | 范围定义的决策框架 |
| **图 2-4**| `flowchart TD` | 为什么最终选了 AWS China 自组装 |
| **图 2-5**| `flowchart TD` | 团队结构 |

### Ch 3: 技术栈全景与预备知识

**图表数量**: 3

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 3-1**| `flowchart TD` | 3.2 核心组件协作全景图 |
| **图 3-2**| `flowchart TD` | 3.3 平台仓库全景与依赖关系图 |
| **图 3-3**| `flowchart LR` | 学习地图 |

## Part II 架构设计

> 8 章 | 41 个图表

### Ch 4: 平台五层模型与设计哲学

**图表数量**: 4

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 4-1**| `flowchart TB` | 4.1 五层模型：Core Infra → Generic Modules... |
| **图 4-2**| `flowchart TD` | 层间依赖规则 |
| **图 4-3**| `flowchart TB` | 三层方案的问题 |
| **图 4-4**| `C4Context` | "平台工程"理念 |

### Ch 5: 端到端数据流全景

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 5-1**| `flowchart LR` | 5.1 一条数据的旅程：上游 → S3 数据湖 → Glue ETL → ... |
| **图 5-2**| `flowchart TD` | 五类数据来源 |
| **图 5-3**| `flowchart LR` | 三类消费出口 |
| **图 5-4**| `sequenceDiagram` | 模式一：事件驱动触发 |
| **图 5-5**| `flowchart LR` | 模式二：批次标识流转 |
| **图 5-6**| `flowchart TD` | 模式三：状态回写 |

### Ch 6: 环境与多账号隔离设计

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 6-1**| `flowchart TD` | 三环境模型 |
| **图 6-2**| `flowchart TD` | 发布路径 |
| **图 6-3**| `flowchart` | 账号级隔离 |
| **图 6-4**| `flowchart` | 两种多环境架构对比 |
| **图 6-5**| `flowchart LR` | AWS Control Tower |

### Ch 7: 数据湖分层设计（Landing/Raw/Enriched）

**图表数量**: 3

| 图号 | 类型 | 描述 |
|------|------|------|
### Ch 7: 数据湖分层设计
| **图 7-1**| `flowchart LR` | 7.1 S3 两层桶（Landing/Raw）与 Spectrum ELT |
| **图 7-2**| `flowchart TD` | Medallion 层间契约（Gold 上移 Redshift） |
| **图 7-3**| `flowchart LR` | 如果重来 |

### Ch 8: 数据仓库设计（Redshift）

**图表数量**: 7

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 8-1**| `flowchart TB` | 集群架构 |
| **图 8-2**| `flowchart LR` | Spectrum：Raw Catalog 外挂与 SQL ELT 入仓 |
| **图 8-3**| `flowchart TB` | Schema 分层 |
| **图 8-4**| `erDiagram` | Kimball 维度建模 |
| **图 8-5**| `flowchart TD` | RLS（Row-Level Security）：行级安全 |
| **图 8-6**| `flowchart LR` | CLS（Column-Level Security）：列级安全 |
| **图 8-7**| `flowchart TB` | RLS + CLS + 脱敏的协同分层 |

### Ch 9: 计算与 ETL 设计（Glue + Lambda）

**图表数量**: 4

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 9-1**| `flowchart TB` | 9.1 计算选型：Glue PySpark vs Python Shell... |
| **图 9-2**| `flowchart TD` | 选型决策树 |
| **图 9-3**| `C4Container` | 9.2 控制面（Lambda）与数据面（Glue）的职责切分 |
| **图 9-4**| `flowchart LR` | 成本模型 |

### Ch 10: 编排与调度设计（Step Functions + EventBridge）

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 10-1**| `flowchart TB` | 10.1 为什么是 Step Functions 而非 Airflow：事... |
| **图 10-2**| `quadrantChart` | 10.2 状态机模式：ingestion / export / simul... |
| **图 10-3**| `stateDiagram-v2` | Ingestion 模式（最核心） |
| **图 10-4**| `stateDiagram-v2` | Export 模式 |
| **图 10-5**| `flowchart LR` | 两种触发方式 |
| **图 10-6**| `flowchart TB` | 组合策略 |

### Ch 11: 配置与状态管理

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 11-1**| `flowchart TB` | 11.1 配置驱动架构：运行时配置存"做什么"，部署配置存"在哪跑" |
| **图 11-2**| `sequenceDiagram` | 配置注入链路 |
| **图 11-3**| `flowchart LR` | 批次标识 |
| **图 11-4**| `flowchart TD` | 增量水位管理 |
| **图 11-5**| `flowchart LR` | 状态追踪 |
| **图 11-6**| `erDiagram` | 审计日志体系 |

## Part III 数据工程实践

> 9 章 | 50 个图表

### Ch 12: 配置驱动的任务模型

**图表数量**: 3

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 12-1**| `flowchart TB` | 12.1 任务声明模型：业务域与数据实体粒度 |
| **图 12-2**| `mindmap` | 12.2 配置字段模型设计：列规范、主键、同步策略的声明式表达 |
| **图 12-3**| `sequenceDiagram` | 12.3 配置注入机制：从声明到运行时参数 |

### Ch 13: 连接器框架总览

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 13-1**| `C4Component` | 13.1 统一作业入口与源系统路由设计 |
| **图 13-2**| `flowchart LR` | 为什么用统一入口而非每源一个 Job |
| **图 13-3**| `flowchart LR` | 13.2 五类连接器：文件/JDBC/API/SaaS/邮件 |
| **图 13-4**| `flowchart LR` | 连接器的统一契约 |
| **图 13-5**| `flowchart LR` | 连接器容错设计：DLQ 死信队列模式 |

### Ch 14: 数据库与 JDBC 连接器

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 14-1**| `flowchart TB` | 14.1 关系型数据库的加载模式设计：全量/增量/自定义 |
| **图 14-2**| `flowchart TD` | 加载模式的选择决策 |
| **图 14-3**| `sequenceDiagram` | 水位追踪机制 |
| **图 14-4**| `flowchart LR` | 示意：迟到数据处理——回溯窗口 + 分区幂等覆盖 |
| **图 14-5**| `flowchart LR` | 处理删除的难题 |
| **图 14-6**| `flowchart LR` | 解决方案： :fontawesome-solid-file-code: J... |

### Ch 15: 文件与 S3 连接器

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 15-1**| `sequenceDiagram` | 信号文件协议 |
| **图 15-2**| `flowchart LR` | 归档与清理 |
| **图 15-3**| `flowchart TB` | S3 事件通知机制 |
| **图 15-4**| `timeline` | 归档生命周期 |
| **图 15-5**| `mindmap` | 支持的文件格式 |
| **图 15-6**| `flowchart TB` | 扩展点设计 |

### Ch 16: API、SaaS 与邮件连接器

**图表数量**: 12

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 16-1**| `flowchart TB` | 16.1 通用 REST 客户端设计：认证体系、分页策略、容错重试 |
| **图 16-2**| `flowchart TB` | 认证策略 |
| **图 16-3**| `flowchart TB` | 分页策略 |
| **图 16-4**| `flowchart TD` | 容错重试 |
| **图 16-5**| `flowchart LR` | 速率限制与重试 |
| **图 16-6**| `sequenceDiagram` | Salesforce Bulk API 2.0 批量抽取（创建作业→轮询→下载→落 S3） |
| **图 16-7**| `flowchart LR` | 双向任务监控 |
| **图 16-8**| `flowchart LR` | AWS SES 邮件摄取架构 |
| **图 16-9**| `flowchart TB` | AWS SES 邮件摄取设计要点 |
| **图 16-10**| `flowchart TB` | Outlook 邮件摄取业务流程 |
| **图 16-11**| `flowchart TB` | Outlook 邮件摄取架构设计 |
| **图 16-12**| `flowchart LR` | Outlook 连接器与标准管线集成 |

### Ch 17: Landing→Raw→Redshift 开发实战

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 17-1**| `flowchart LR` | 17.1 三层开发的职责与产物 |
| **图 17-2**| `flowchart TB` | 质量校验架构 |
| **图 17-3**| `flowchart TD` | 阈值治理 |
| **图 17-4**| `flowchart LR` | 代理键生成 |
| **图 17-5**| `flowchart TB` | 行数对账 |

### Ch 18: 数据脱敏与隐私治理

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 18-1**| `flowchart TB` | 18.1 匿名化策略矩阵：脱敏、部分脱敏、加密、哈希 |
| **图 18-2**| `flowchart LR` | 18.2 配置驱动的字段级脱敏设计 |
| **图 18-3**| `flowchart LR` | KMS 信封加密与密钥分层 |
| **图 18-4**| `flowchart TD` | DSR 数据主体权利响应 |
| **图 18-5**| `flowchart TB` | 18.3 Redshift RLS/CLS 与脱敏 UDF 的协同防护体系 |
| **图 18-6**| `flowchart TD` | 三层协同的实战场景 |

### Ch 19: 任务开发配方与实战案例

**图表数量**: 4

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 19-1**| `flowchart LR` | 19.1 Recipe 1：复制现有任务新增同类 |
| **图 19-2**| `flowchart TB` | 19.2 Recipe 2：接入新数据源 |
| **图 19-3**| `flowchart LR` | 19.3 Recipe 3：新增文件格式支持 |
| **图 19-4**| `flowchart TB` | 19.4 Recipe 4：修改调度与运行时控制 |

### Ch 20: 元数据管理与数据血缘

**图表数量**: 7

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 20-1**| `erDiagram` | 20.1 元数据模型设计：审计日志、加载历史、变更日志 |
| **图 20-2**| `mindmap` | 元数据的价值 |
| **图 20-3**| `flowchart TB` | Glue Data Catalog |
| **图 20-4**| `flowchart LR` | Schema 自动发现的价值 |
| **图 20-5**| `flowchart TB` | 两种血缘方案对比 |
| **图 20-6**| `flowchart LR` | OpenLineage / DataHub 简介 |
| **图 20-7**| `timeline` | 从被动血缘到主动血缘：演进路线图 |

## Part IV 基础设施与工程效能

> 10 章 | 48 个图表

### Ch 21: :simple-terraform: Terraform 架构总览

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 21-1**| `flowchart LR` | State 后端 |
| **图 21-2**| `flowchart TB` | State 隔离（独立桶） |
| **图 21-3**| `flowchart TB` | IaC 仓分层（meta/core/platform/modules/domain/CI） |
| **图 21-4**| `flowchart LR` | Git Submodule 模式 |
| **图 21-5**| `flowchart LR` | Remote State 引用 |

### Ch 22: 核心基础设施仓库设计

**图表数量**: 4

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 22-1**| `flowchart TB` | 22.1 core-infra：数据湖桶、IAM、Redshift 基座、... |
| **图 22-2**| `flowchart LR` | 设计原则：共享资源集中管理 |
| **图 22-3**| `flowchart LR` | Remote State 输出 |
| **图 22-4**| `flowchart TB` | 治理层设计 |

### Ch 23: 业务仓库设计与同构模式

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 23-1**| `flowchart TB` | 23.1 业务 IaC 仓的同构目录结构设计 |
| **图 23-2**| `flowchart LR` | 23.2 为什么刻意保持结构同构 |
| **图 23-3**| `flowchart LR` | 始祖仓的演化 |
| **图 23-4**| `flowchart TB` | 拆分决策 |
| **图 23-5**| `flowchart TB` | 23.4 引申：monorepo vs polyrepo 的 IaC 治理对比 |

### Ch 24: 通用 :simple-terraform: Terraform 模块设计

**图表数量**: 4

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 24-1**| `flowchart TB` | 24.1 区域模块与全球模块的分工 |
| **图 24-2**| `flowchart LR` | 24.2 模块版本化与变更治理 |
| **图 24-3**| `flowchart TD` | 模块升级流程 |
| **图 24-4**| `flowchart TB` | 24.3 引申：Terraform 模块设计原则 |

### Ch 25: 环境参数与 tfvars 模型

**图表数量**: 4

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 25-1**| `flowchart TB` | 25.1 环境级参数文件与按服务拆分策略 |
| **图 25-2**| `flowchart LR` | 按服务拆分的好处 |
| **图 25-3**| `flowchart TB` | 25.2 运行时配置 vs 部署参数的边界 |
| **图 25-4**| `flowchart LR` | 25.3 后端配置多环境隔离 |

### Ch 26: Step Functions 模板注入

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 26-1**| `flowchart LR` | 26.1 状态机模板的参数化与环境变量注入 |
| **图 26-2**| `flowchart TB` | 26.1 状态机模板的参数化与环境变量注入 |
| **图 26-3**| `flowchart LR` | 模板化设计 |
| **图 26-4**| `flowchart TD` | 依赖排序问题 |
| **图 26-5**| `flowchart LR` | 依赖排序问题 |
| **图 26-6**| `flowchart TB` | 26.3 模板化 vs 硬编码的维护性权衡 |

### Ch 27: CI/CD：可复用工作流平台

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 27-1**| `flowchart LR` | 27.1 GitHub Actions reusable workflows + custom actions 两层架构 |
| **图 27-2**| `flowchart LR` | 两层分离的价值 |
| **图 27-3**| `flowchart TB` | 27.2 自托管 runner 与容器化执行环境 |
| **图 27-4**| `flowchart TD` | 27.3 变更检测驱动的增量 CI |
| **图 27-5**| `flowchart TB` | Terraform CI 生命周期编排 |

### Ch 28: 四类发布流

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 28-1**| `flowchart TB` | 28.1-28.4 四类发布流 |
| **图 28-2**| `flowchart LR` | Terraform 发布流 |
| **图 28-3**| `flowchart LR` | Glue 脚本发布流 |
| **图 28-4**| `flowchart LR` | 配置发布流 |
| **图 28-5**| `flowchart LR` | 28.5 feature→dev→qa→prod 的晋升路径与审批门禁 |
| **图 28-6**| `flowchart TB` | 审批门禁设计 |

### Ch 29: OIDC 与凭证治理

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 29-1**| `flowchart LR` | 传统方式的问题 |
| **图 29-2**| `sequenceDiagram` | OIDC 方案 |
| **图 29-3**| `flowchart LR` | OIDC 方案 |
| **图 29-4**| `flowchart TB` | 数据库凭证管理 |
| **图 29-5**| `flowchart TB` | 零信任原则 |

### Ch 30: 工程师日常工作流与变更场景

**图表数量**: 4

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 30-1**| `timeline` | 30.1 工程师的一天：从 PR 到生产 |
| **图 30-2**| `flowchart TD` | 变更的分类决策 |
| **图 30-3**| `flowchart LR` | 30.3 代码质量门禁体系 |
| **图 30-4**| `flowchart TB` | 质量门禁的分层设计 |

## Part V 平台演进

> 4 章 | 30 个图表

### Ch 31: 遗留系统迁移：SQL Server → Redshift（10TB）

**图表数量**: 11

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 31-1**| `flowchart LR` | 31.1 迁移挑战：10TB/千表的大规模离线迁移 |
| **图 31-2**| `flowchart LR` | 数据库恢复子系统 |
| **图 31-3**| `flowchart TB` | Schema 自动转换 |
| **图 31-4**| `gantt` | 迁移性能基线 |
| **图 31-5**| `flowchart LR` | 31.3 流式导出 + 分片压缩 + 对象存储中转 + 批量加载 |
| **图 31-6**| `flowchart TB` | 设计要点 |
| **图 31-7**| `flowchart TB` | 断点续传 |
| **图 31-8**| `flowchart LR` | 状态持久化 |
| **图 31-9**| `flowchart TD` | 回滚方案 |
| **图 31-10**| `flowchart TB` | 并发资源治理 |
| **图 31-11**| `flowchart TB` | 31.5 引申：托管迁移服务 vs 自研管线 |

### Ch 32: 跨账号批量同步：双桶桥接架构

**图表数量**: 8

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 32-1**| `flowchart LR` | 32.1 跨账号数据同步的难题与约束 |
| **图 32-2**| `C4Container` | 32.2 双桶架构设计：源卸载→源桶→桥接→目标桶→目标加载 |
| **图 32-3**| `C4Dynamic` | 跨账号同步时序 |
| **图 32-4**| `flowchart TB` | 为什么用 rclone 做桥接 |
| **图 32-5**| `flowchart TB` | 32.3 三层凭证模型：最小权限与跨账号安全 |
| **图 32-6**| `flowchart LR` | 安全设计原则 |
| **图 32-7**| `flowchart LR` | 32.4 DDL 自动克隆与结构迁移 |
| **图 32-8**| `flowchart TB` | 32.5 执行通道：Glue + boto3（Data API）为主 |

### Ch 33: 自研 DAG 调度器与任务编排

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 33-1**| `flowchart TB` | 33.1 轻量 DAG 引擎设计：任务图建模与调度循环 |
| **图 33-2**| `flowchart LR` | 任务图建模 |
| **图 33-3**| `flowchart TD` | 调度循环 |
| **图 33-4**| `flowchart LR` | 栅栏节点（Barrier） |
| **图 33-5**| `flowchart TD` | 错误传播语义 |
| **图 33-6**| `flowchart TB` | 33.3 引申：自研轻量 DAG vs Airflow/Dagster 的边界 |

### Ch 34: 设计边界与已知取舍的诚实复盘

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 34-1**| `mindmap` | 34.1 已知设计边界与原子性缺口 |
| **图 34-2**| `flowchart TD` | 边界①：truncate→COPY 非原子（最严重） |
| **图 34-3**| `flowchart LR` | 边界⑤：单线程调度 |
| **图 34-4**| `mindmap` | 34.3 引申：工程诚实——文档化已知缺陷的价值 |
| **图 34-5**| `flowchart LR` | 如何管理已知缺陷 |

## Part VI 衍生业务系统

> 3 章 | 47 个图表

### Ch 35: 衍生业务系统总领：平台的能力外延

**图表数量**: 4

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 35-1**| `flowchart LR` | 35.1 什么是衍生业务系统 |
| **图 35-2**| `flowchart TB` | 系统一：零售数据源门户（Ch 36） |
| **图 35-3**| `mindmap` | 系统二：DaaS 激活层（Ch 37） |
| **图 35-4**| `flowchart TD` | 35.5 何时创建衍生系统 vs 扩展平台 |

### Ch 36: 低代码 + 云混合：零售数据源门户

**图表数量**: 18

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 36-1**| `flowchart LR` | 36.1 业务背景：百张零售源表的多供应商管理 |
| **图 36-2**| `flowchart TB` | 36.2 为什么选 Power Platform + Azure 而非纯 ... |
| **图 36-3**| `flowchart TB` | 36.3 产品设计：三个 PCF 控件 |
| **图 36-4**| `flowchart LR` | PCF 架构 |
| **图 36-5**| `flowchart TB` | 版本控制三元组 |
| **图 36-6**| `flowchart LR` | 为什么用三元组而非传统版本控制 |
| **图 36-7**| `flowchart LR` | 36.5.1 手写 HMAC-SHA256 SAS 令牌（Azure SD... |
| **图 36-8**| `flowchart TB` | 36.5.1 手写 HMAC-SHA256 SAS 令牌（Azure SD... |
| **图 36-9**| `flowchart LR` | 36.5.2 DuckDB 绕过 Dataverse 10 万行导出限制 |
| **图 36-10**| `flowchart LR` | 36.5.3 增量合并优化：LeftAnti 连接的 O(M+N) 策略 |
| **图 36-11**| `flowchart TB` | 36.6 工程模块二：T+1 双向同步 |
| **图 36-12**| `flowchart LR` | 36.6.1 入向同步：Redshift → Parquet → Azur... |
| **图 36-13**| `sequenceDiagram` | 36.6.1 入向同步：Redshift → Parquet → Azur... |
| **图 36-14**| `flowchart LR` | 36.6.2 出向同步：Synapse Link → Data Lake ... |
| **图 36-15**| `flowchart LR` | 36.6.3 模板化 Power Query 脚本生成 |
| **图 36-16**| `flowchart TB` | 36.6.4 跨云同步的一致性与时效性权衡 |
| **图 36-17**| `flowchart LR` | 36.6.4 跨云同步的一致性与时效性权衡 |
| **图 36-18**| `flowchart TB` | 36.7 引申：低代码 + 云混合的边界 |

### Ch 37: 数据即服务（DaaS）：激活层设计

**图表数量**: 25

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 37-1**| `flowchart TB` | 三条设计原则 |
| **图 37-2**| `flowchart LR` | 统一 Lambda 分发器 |
| **图 37-3**| `flowchart TB` | API 框架选型决策 |
| **图 37-4**| `flowchart TB` | DaaS 挂靠 CDP IaC |
| **图 37-5**| `flowchart TB` | 核心问题：隔离该在哪里强制？ |
| **图 37-6**| `sequenceDiagram` | 数据库层隔离如何工作 |
| **图 37-7**| `classDiagram` | Tenant Context 全程流转 |
| **图 37-8**| `flowchart TB` | RBAC + RLS + CLS 三层防护 |
| **图 37-9**| `flowchart LR` | 为什么是两套 |
| **图 37-10**| `sequenceDiagram` | Query API：同步查询与 LIMIT+1 截断检测 |
| **图 37-11**| `flowchart TB` | Query API：同步查询与 LIMIT+1 截断检测 |
| **图 37-12**| `stateDiagram-v2` | Bulk API：异步状态机与 S3 交付 |
| **图 37-13**| `sequenceDiagram` | Bulk API：异步状态机与 S3 交付 |
| **图 37-14**| `flowchart TB` | 数据交付策略矩阵 |
| **图 37-15**| `sequenceDiagram` | 会话复用：问题与方案 |
| **图 37-16**| `sequenceDiagram` | 会话复用：缓存命中 |
| **图 37-17**| `stateDiagram-v2` | 会话生命周期 |
| **图 37-18**| `flowchart TB` | 容错：失效会话自动重试 |
| **图 37-19**| `flowchart TB` | 五层纵深 |
| **图 37-20**| `flowchart TB` | SQL 校验管线 |
| **图 37-21**| `flowchart LR` | 三级安全等级 |
| **图 37-22**| `flowchart LR` | Powertools 可观测三件套 |
| **图 37-23**| `flowchart LR` | 幂等：SQL 哈希 + 幂等键 |
| **图 37-24**| `flowchart TB` | 三种数据激活模式 |
| **图 37-25**| `flowchart LR` | DaaS 多租户方案对比 |

## Part VII Agentic BI

> 12 章 | 81 个图表

### Ch 38: 时代命题：AI-Ready 数据供应

**图表数量**: 7

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 38-1**| `flowchart LR` | 38.1 为什么纯数据平台不够了：BI 自助化的瓶颈 |
| **图 38-2**| `flowchart LR` | NL2SQL 的演进谱系 |
| **图 38-3**| `flowchart TB` | Agentic BI 不是"聊天机器人" |
| **图 38-4**| `flowchart LR` | 转型诉求 |
| **图 38-5**| `flowchart LR` | NewtonData 的引入 |
| **图 38-6**| `flowchart TB` | 38.4 AI-Ready 数据的五个特征 |
| **图 38-7**| `flowchart TD` | 38.5 build vs buy：Agentic BI 的方案决策框架 |

### Ch 39: Agentic BI 架构总览

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 39-1**| `C4Context` | 39.1 双平面分离：语义平面（治理）+ 数据平面（执行） |
| **图 39-2**| `flowchart TB` | 39.2 五层逻辑模型（L1 交互→L5 治理，单向调用） |
| **图 39-3**| `flowchart LR` | 39.3 9 步在线查询流 |
| **图 39-4**| `flowchart TB` | 39.4 确定性 DAG + 条件路由 vs ReAct 自治的取舍 |
| **图 39-5**| `quadrantChart` | 39.5 引申：Agentic BI 的三种范式对比 |

### Ch 40: 语义平面：三层治理与 Git+:simple-yaml: YAML

**图表数量**: 8

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 40-1**| `flowchart TB` | 40.1 三层治理：L1 元数据契约 / L2 术语治理 / L3 业务规则 |
| **图 40-2**| `flowchart LR` | 三层的关系 |
| **图 40-3**| `flowchart TB` | 9 种资产类型 |
| **图 40-4**| `flowchart LR` | 为什么选 Git+YAML 而非数据库 |
| **图 40-5**| `flowchart LR` | 40.3 离线发布管线 |
| **图 40-6**| `flowchart TB` | CI 校验内容 |
| **图 40-7**| `flowchart LR` | 40.4 资产认证生命周期 |
| **图 40-8**| `flowchart TB` | 40.5 引申：对比 dbt Semantic Layer / Cube ... |

### Ch 41: R/V/G/D 四引擎 RAG 检索

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 41-1**| `flowchart TB` | 41.1 四引擎 RAG：R/V/G/D 并行+串行协作 |
| **图 41-2**| `flowchart LR` | 41.2 Reranker 四阶段重排 |
| **图 41-3**| `flowchart LR` | 41.3 术语绑定强路由：业务术语全链路传播 |
| **图 41-4**| `flowchart TD` | 41.4 Corrective-RAG 回退与重排 |
| **图 41-5**| `flowchart LR` | 41.6 Naive→Advanced→Modular RAG 演进谱系 |

### Ch 42: Agent 编排：LangGraph 与状态机

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 42-1**| `flowchart TB` | 42.1 LangGraph StateGraph 机制 |
| **图 42-2**| `flowchart TD` | 节点拓扑 |
| **图 42-3**| `flowchart TD` | 修复回路（自愈） |
| **图 42-4**| `flowchart LR` | SQL 缓存快路径 |
| **图 42-5**| `flowchart LR` | HITL 审批流程 |
| **图 42-6**| `flowchart TB` | 42.5 引申：ReAct / Plan-and-Execute / Re... |

### Ch 43: 语义查询规划器：Steiner 树与代数改写

**图表数量**: 8

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 43-1**| `flowchart LR` | 43.1 NL2SQL 技术谱系 |
| **图 43-2**| `flowchart TB` | 问题 |
| **图 43-3**| `flowchart LR` | KMB Steiner 树算法 |
| **图 43-4**| `flowchart TB` | 43.3 三种代数改写 |
| **图 43-5**| `flowchart LR` | ① 鸿沟陷阱（Chasm Trap）改写 |
| **图 43-6**| `flowchart LR` | ② 冗余连接消除 |
| **图 43-7**| `flowchart LR` | ③ 存在语义改写 |
| **图 43-8**| `flowchart TB` | 43.4 引申：NL2SQL 的经典陷阱 |

### Ch 44: 五层 SQL 护栏与执行安全

**图表数量**: 7

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 44-1**| `flowchart TB` | 44.1 五层护栏：语法→策略黑名单→AST 列白名单→术语语义→成本估算 |
| **图 44-2**| `flowchart LR` | 提示注入防御 |
| **图 44-3**| `flowchart LR` | 咨询模式 |
| **图 44-4**| `flowchart TD` | 自愈回路 |
| **图 44-5**| `flowchart TB` | 44.3 执行安全：LIMIT + 超时 + PII 分级 + RLS/C... |
| **图 44-6**| `flowchart LR` | RLS/CLS 联动 |
| **图 44-7**| `quadrantChart` | 44.4 引申：LLM 生成代码的沙箱与执行治理 |

### Ch 45: 记忆系统与工具使用

**图表数量**: 7

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 45-1**| `flowchart TB` | 45.1 四层记忆：Working/Profile/Episodic/Co... |
| **图 45-2**| `flowchart LR` | 记忆的形成与使用 |
| **图 45-3**| `flowchart LR` | SQL 语义缓存 |
| **图 45-4**| `flowchart TB` | 动态 few-shot 自积累 |
| **图 45-5**| `flowchart TB` | 45.3 三种工具范式：函数工具 / 节点即工具 / ML 能力注册表 |
| **图 45-6**| `flowchart LR` | ML 能力注册表 |
| **图 45-7**| `flowchart LR` | 什么是 MCP |

### Ch 46: 数据平面与 CDP 整合

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 46-1**| `flowchart TB` | 46.1 数据平面：Redshift Serverless 多环境 |
| **图 46-2**| `flowchart LR` | 46.2 语义检索层：图+向量检索引擎 |
| **图 46-3**| `flowchart TB` | 46.3 把语义层接到 CDP：Redshift 作为 Agentic B... |
| **图 46-4**| `flowchart LR` | 46.4 AI-Ready 数据供应的落地：从数仓表到治理化语义资产 |
| **图 46-5**| `flowchart TD` | 转化的四个步骤 |
| **图 46-6**| `flowchart TB` | 46.5 引申：湖仓一体的语义层如何统一湖与仓的 AI 消费 |

### Ch 47: 多模态业务知识库：Knowhere × PixelRAG 与 LumenKB

**图表数量**: 8

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 47-1**| `flowchart TB` | 传统切块失败 vs LumenKB 双通道 |
| **图 47-2**| `flowchart LR` | Knowhere：文档 → Agent-ready memory |
| **图 47-3**| `flowchart TB` | Cloud / Self-hosted / SDK 三角取舍 |
| **图 47-4**| `flowchart LR` | PixelRAG 视觉检索路径 |
| **图 47-5**| `flowchart TB` | LumenKB 双通道摄入 |
| **图 47-6**| `flowchart TB` | 摄入失败策略：探测 fail-open、解析 fail-closed、视觉非阻塞 |
| **图 47-7**| `flowchart LR` | 语义树锚点：视觉命中挂回章节 |
| **图 47-8**| `flowchart TB` | 查询侧 prompt 级融合（非跨模态 RRF） |

### Ch 48: 一线产品助手：FieldGenie 与 MCP 增强 Agentic BI

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 48-1**| `flowchart LR` | 材料供给：门户/文档湖 → LumenKB → 一线与 Agent |
| **图 48-2**| `flowchart TB` | FieldGenie 答案形态：检索 → 生成 → 富化 |
| **图 48-3**| `flowchart LR` | FieldGenie 主路径：check_cache → retrieve → generate → enrich |
| **图 48-4**| `flowchart LR` | Explore 分支：跳过 generate，只追加证据 |
| **图 48-5**| `sequenceDiagram` | NewtonData 经 MCP 调用 LumenKB |

### Ch 49: 评估、可观测与持续演进

**图表数量**: 9

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 49-1**| `flowchart TB` | 49.1 Agent 评估方法论 |
| **图 49-2**| `flowchart TD` | 三级评估体系 |
| **图 49-3**| `mindmap` | 治理 CI 校验 |
| **图 49-4**| `flowchart TB` | LLM-as-a-Judge 四维评估 |
| **图 49-5**| `flowchart LR` | 基准评测结果 |
| **图 49-6**| `flowchart TB` | 49.3 可观测四通道：从流水线到观测目标 |
| **图 49-8**| `timeline` | 49.4 Roadmap：多租户 RLS、多 Provider 抽象、基准评测 |
| **图 49-9**| `flowchart LR` | 多 Provider 抽象 |
| **图 49-10**| `flowchart LR` | 49.2 反馈闭环：用户反馈→系统改进 |

## Part VIII 治理、复盘与展望

> 6 章 | 39 个图表

### Ch 50: 安全、合规与治理

**图表数量**: 12

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 50-1**| `flowchart TB` | IAM 治理体系 |
| **图 50-2**| `flowchart LR` | KMS 加密 |
| **图 50-3**| `flowchart LR` | 50.2 数据分类框架：分级保护的基础 |
| **图 50-4**| `flowchart TB` | GxP ALCOA+ 原则（回顾 Ch 18） |
| **图 50-5**| `flowchart LR` | 中国数据驻留 |
| **图 50-6**| `flowchart TB` | 50.4 Redshift RLS/CLS 策略在数据治理中的深度应用 |
| **图 50-7**| `flowchart LR` | RLS 策略绑定与租户隔离 |
| **图 50-8**| `flowchart TB` | CLS 列级权限与敏感字段控制 |
| **图 50-9**| `flowchart LR` | RLS/CLS 与审计日志联动 |
| **图 50-10**| `flowchart TB` | 50.5 治理最佳实践与平台护栏 |
| **图 50-11**| `flowchart TD` | 50.6 安全事件响应：从告警到复盘的全流程 |
| **图 50-12**| `flowchart LR` | 50.7 灾难恢复与业务连续性 |

### Ch 51: 日志、监控、审计与告警

**图表数量**: 6

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 51-1**| `flowchart TB` | 51.1 CloudWatch/CloudTrail 与审计日志持久化 |
| **图 51-2**| `flowchart TB` | CloudWatch 仪表板布局设计 |
| **图 51-3**| `flowchart LR` | CloudTrail |
| **图 51-4**| `flowchart LR` | 告警体系 |
| **图 51-5**| `flowchart TD` | 运营 Runbook |
| **图 51-6**| `flowchart TB` | 51.3 引申：数据平台可观测性 vs 应用可观测性 |

### Ch 52: 排障与可观测性实战

**图表数量**: 5

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 52-1**| `flowchart TD` | 排障决策树 |
| **图 52-2**| `flowchart LR` | 数据缺失的排查流程 |
| **图 52-3**| `flowchart TD` | 52.3 跨账号同步的已知边界排障 |
| **图 52-4**| `timeline` | 52.4 排障演练：fact_prescription 数据突然为空 |
| **图 52-5**| `flowchart TD` | 52.5 性能退化排障：查询延迟从 3 秒涨到 30 秒 |

### Ch 53: 价值度量与案例复盘

**图表数量**: 7

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 53-1**| `flowchart LR` | 53.1 零售门户量化价值 |
| **图 53-2**| `flowchart TB` | 价值来源拆解 |
| **图 53-3**| `flowchart TB` | 四维价值度量 |
| **图 53-4**| `flowchart LR` | 价值度量的时间轴 |
| **图 53-5**| `flowchart LR` | 53.3 案例综合：从孤岛到 Agentic BI 的端到端价值链 |
| **图 53-6**| `flowchart LR` | Agentic BI 量化价值 |
| **图 53-7**| `flowchart LR` | Agentic BI 量化价值 |

### Ch 54: 架构师的复盘：取舍、遗憾与主流对比

**图表数量**: 7

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 54-1**| `timeline` | :material-school: 本章你将学到 |
| **图 54-2**| `flowchart TB` | 54.1 当时做对的事 |
| **图 54-3**| `flowchart TB` | 54.2 当时的遗憾 |
| **图 54-4**| `flowchart TB` | 54.3 与主流方案的系统性对比 |
| **图 54-5**| `flowchart TD` | 选型建议 |
| **图 54-6**| `flowchart TB` | 54.4 如果重来：下一代数据平台的十个设计原则 |
| **图 54-7**| `gantt` | 如果今天重建：12 个月落地计划 |

### Ch 55: 致谢与团队

**图表数量**: 2

| 图号 | 类型 | 描述 |
|------|------|------|
| **图 55-1**| `flowchart TB` | 55.1 团队结构 |
| **图 55-2**| `flowchart LR` | 55.2 协作模式 |
