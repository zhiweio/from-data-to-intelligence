# 附录 C 技术栈速查表

!!! info "面包屑"
    [本书主页](./index.md) › 附录 C

---

## AWS 技术栈

| 服务 | 类别 | 用途 | 章节 |
|---|---|---|---|
| S3 | 存储 | 数据湖分层存储 | Ch 7 |
| Redshift | 分析 | 数据仓库（MPP 列式） | Ch 8 |
| Redshift Serverless | 分析 | Agentic BI 执行后端（多环境） | Ch 38, 46 |
| Glue | 计算 | 托管 Spark ETL（:simple-apachespark: PySpark/:simple-python: Python Shell） | Ch 9 |
| Lambda | 计算 | 无服务器函数（控制面） | Ch 9 |
| Step Functions | 编排 | 状态机编排 | Ch 10 |
| EventBridge | 调度 | 定时触发 + 事件路由 | Ch 10 |
| DynamoDB | 数据库 | 任务配置与状态存储 | Ch 11 |
| Athena | 查询 | S3 数据 SQL 查询 | Ch 7 |
| Glue Data Catalog | 元数据 | Schema 发现与数据目录 | Ch 20 |
| Secrets Manager | 安全 | 密钥管理 + 自动轮转 | Ch 29 |
| KMS | 安全 | 加密密钥 | Ch 50 |
| IAM | 安全 | 权限管理 | Ch 50 |
| CloudWatch | 监控 | 日志/指标/告警 | Ch 51 |
| CloudTrail | 审计 | API 调用审计 | Ch 51 |
| API Gateway | API | DaaS REST API 入口 | Ch 37 |
| SNS | 通知 | 告警通知 | Ch 51 |
| SQS | 消息 | 事件缓冲 | Ch 15 |
| OIDC | 身份 | CI 无密钥认证 | Ch 29 |

## Azure / Microsoft 技术栈

| 技术 | 用途 | 章节 |
|---|---|---|
| Power Platform | 低代码平台（零售门户） | Ch 36 |
| Dataverse | Power Platform 数据存储 | Ch 36 |
| PCF | Power Apps Component Framework（自定义控件） | Ch 36 |
| Power Automate | 事件驱动编排 | Ch 36 |
| Power Query Dataflow | 数据转换与同步 | Ch 36 |
| Azure Blob Storage | 跨云中转存储 | Ch 36 |
| Azure Data Lake | Synapse Link 导出目标 | Ch 36 |
| Azure Function App | :simple-duckdb: DuckDB 大导出执行 | Ch 36 |
| 21Vianet | Azure China 运营商 | Ch 50 |

## 开发与 IaC 技术栈

| 技术 | 用途 | 章节 |
|---|---|---|
| :simple-terraform: Terraform | 基础设施即代码 | Ch 21-25 |
| :simple-githubactions: GitHub Actions | CI/CD 平台 | Ch 27-28 |
| Python | 主开发语言（Glue/Lambda） | 全书 |
| HCL | Terraform 配置语言 | Ch 21 |
| PyDeequ | 数据质量校验 | Ch 17 |
| :simple-rclone: rclone | 跨账号 S3 桥接 | Ch 32 |
| DuckDB | 嵌入式分析数据库 | Ch 36 |
| boto3 / Redshift Data API | Glue 调 Redshift（COPY/UNLOAD/DDL） | Ch 5, 32 |
| :simple-postgresql: psycopg2 | Redshift 排障备用直连（非 JDBC） | Ch 32 |
| Jinja2 | 模板引擎（Power Query 生成） | Ch 36 |
| pre-commit | :octicons-git-commit-16: 代码提交前检查 | Ch 30 |
| :simple-sonar: SonarQube | 代码质量扫描 | Ch 30 |
| SQLFluff | SQL 规范检查 | Ch 30 |

## AI / Agentic BI 技术栈

| 技术 | 用途 | 章节 |
|---|---|---|
| LangGraph | Agent 编排（状态图） | Ch 42 |
| :simple-langchain: LangChain | LLM 应用框架 | Ch 45 |
| :simple-fastapi: FastAPI | 后端 API 服务 | Ch 39, 47, 48 |
| PostgreSQL + AGE | 图引擎（Engine G） | Ch 41 |
| pgvector | 向量检索（Engine V） | Ch 41 |
| Next.js / :simple-react: React | 前端交互层（L1） | Ch 39, 48 |
| Langfuse | Agent 链路追踪 | Ch 49 |
| :simple-prometheus: Prometheus | AI 指标监控 | Ch 49 |
| DeepEval / Ragas | LLM 评估框架 | Ch 49 |
| MCP | Model Context Protocol（工具标准） | Ch 45, 48 |

## 多模态业务知识库技术栈

| 技术 | 用途 | 章节 |
|---|---|---|
| [Knowhere](https://github.com/Ontos-AI/knowhere)（Ontos-AI） | 非结构化文档 → 语义结构化 memory | Ch 47 |
| knowhere-parse-sdk | Knowhere 解析管线的进程内 SDK（合规驻留） | Ch 47 |
| [PixelRAG](https://github.com/StarTrail-org/PixelRAG) | 视觉 tile 嵌入与版式/图表检索 | Ch 47 |
| Milvus | 双集合向量索引（text + visual） | Ch 47 |
| Qwen3-VL / Qwen-VL | 视觉嵌入与多模态生成 | Ch 47 |
| Celery + Redis | 摄入队列（文本/视觉分流） | Ch 47 |
| MinIO | 文档与图块对象存储 | Ch 47 |

## 数据格式与协议

| 格式/协议 | 用途 | 章节 |
|---|---|---|
| :simple-apacheparquet: Parquet | 数据湖列式存储格式 | Ch 7 |
| :material-database-sync: Iceberg / Delta / Hudi | 表格式（引申对比） | Ch 7 |
| :simple-json: JSON | 配置文件 / API 交互 | 全书 |
| :simple-yaml: YAML | 语义资产 / Terraform | Ch 40 |
| :fontawesome-solid-file-csv: CSV / :fontawesome-solid-file-csv: TSV | 文件源数据格式 | Ch 15 |
| SAS 令牌 | Azure Blob 认证 | Ch 36 |
| OIDC Token | CI 认证 | Ch 29 |
| JWT | DaaS API 鉴权 | Ch 37 |

## 技术选型决策速查

| 决策点 | 选择 | 理由 | 章节 |
|---|---|---|---|
| 云平台 | AWS China | 四年前唯一可用的完整国际云栈 | Ch 2 |
| IaC | Terraform | 跨云可移植 + 模块生态 | Ch 2 |
| 编排 | Step Functions | Serverless + 原生 AWS 集成 | Ch 10 |
| 数据湖格式 | Parquet（当时） | 稳定简单；如果重来选 Iceberg | Ch 7 |
| 数据仓库 | Redshift | AWS 生态 + China 可用 | Ch 8 |
| AI 执行后端 | Redshift Serverless | 执行隔离 + 按量计费 | Ch 38 |
| 文档解析交付 | knowhere-parse-sdk（进程内） | 避免 Cloud 出域与 self-hosted 过重 | Ch 47 |
| 多模态检索 | Knowhere 文本 + PixelRAG 视觉 | 表格/图/章节一等公民 | Ch 47 |
| LLM 编排 | LangGraph | 状态图 + 条件路由 | Ch 42 |
| 语义管理 | Git+YAML | 版本控制 + :octicons-git-pull-request-16: PR 审查 + CI | Ch 40 |
