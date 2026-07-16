# 附录 D 参考文献与延伸阅读

!!! info "面包屑"
    [本书主页](./index.md) › 附录 D

---

## 书籍

| 书名 | 作者 | 相关章节 | 推荐理由 |
|---|---|---|---|
| 《数据仓库工具箱》 | Ralph Kimball | Ch 8 | 维度建模的经典教科书 |
| 《Team Topologies》 | Matthew Skelton | Ch 4 | 平台团队与流式团队的拓扑模型 |
| 《Designing Data-Intensive Applications》 | Martin Kleppmann | Ch 7, 8 | 数据系统底层原理的圣经 |
| 《The Data Warehouse Toolkit》 | Ralph Kimball | Ch 8 | 数仓设计方法论 |
| 《Fundamentals of Data Engineering》 | Joe Reis & Matt Housley | 全书 | 现代数据工程全景 |
| 《Building Evolutionary Architectures》 | Neal Ford | Ch 54 | 可演进架构的设计原则 |

## AWS 官方文档

| 资源 | 相关章节 |
|---|---|
| [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/) | Ch 4 |
| [Building a Data Lake](https://aws.amazon.com/big-data/datalakes-and-analytics/) | Ch 3, 7 |
| [Redshift RLS/CLS](https://docs.aws.amazon.com/redshift/) | Ch 8, 18, 50 |
| [Step Functions Developer Guide](https://docs.aws.amazon.com/step-functions/) | Ch 10 |
| [Glue Developer Guide](https://docs.aws.amazon.com/glue/) | Ch 9 |
| [:simple-terraform: Terraform on AWS](https://developer.hashicorp.com/terraform) | Ch 21 |
| [:simple-githubactions: GitHub Actions OIDC with AWS](https://docs.github.com/actions/deployment/security-hardening-your-deployments/) | Ch 29 |

## 开源项目与框架

| 项目 | 相关章节 | 用途 |
|---|---|---|
| [Terraform](https://developer.hashicorp.com/terraform) | Ch 21-25 | 基础设施即代码 |
| [Apache :material-database-sync: Iceberg](https://iceberg.apache.org/) | Ch 7 | 表格式（引申） |
| [Delta Lake](https://delta.io/) | Ch 7 | 表格式（引申） |
| [Apache Hudi](https://hudi.apache.org/) | Ch 7 | 表格式（引申） |
| [PyDeequ](https://github.com/awslabs/python-deequ) | Ch 17 | 数据质量校验 |
| [Great Expectations](https://greatexpectations.io/) | Ch 17 | 数据质量（引申替代） |
| [OpenLineage](https://openlineage.io/) | Ch 20, 53 | 主动血缘标准 |
| [DataHub](https://datahubproject.io/) | Ch 20 | 元数据平台 |
| [:simple-duckdb: DuckDB](https://duckdb.org/) | Ch 37 | 嵌入式分析数据库 |
| [:simple-rclone: rclone](https://rclone.org/) | Ch 32 | 跨云存储复制 |
| [LangGraph](https://langchain-ai.github.io/langgraph/) | Ch 42 | Agent 编排 |
| [:simple-langchain: LangChain](https://langchain.com/) | Ch 45 | LLM 应用框架 |
| [pgvector](https://github.com/pgvector/pgvector) | Ch 41 | :simple-postgresql: PostgreSQL 向量检索 |
| [Apache AGE](https://age.apache.org/) | Ch 41 | PostgreSQL 图引擎 |
| [:simple-fastapi: FastAPI](https://fastapi.tiangolo.com/) | Ch 39 | :simple-python: Python API 框架 |
| [DeepEval](https://github.com/confident-ai/deepeval) | Ch 49 | LLM 评估框架 |
| [Ragas](https://github.com/explodinggradients/ragas) | Ch 49 | RAG 评估框架 |
| [Langfuse](https://langfuse.com/) | Ch 49 | LLM 可观测平台 |
| [Knowhere](https://github.com/Ontos-AI/knowhere) | Ch 47 | 非结构化文档 → Agent-ready memory |
| [PixelRAG](https://github.com/StarTrail-org/PixelRAG) | Ch 47 | 视觉文档 RAG |
| [Model Context Protocol](https://modelcontextprotocol.io/) | Ch 45, 48 | AI 工具标准协议 |
| [Milvus](https://milvus.io/) | Ch 47 | 向量数据库（双集合索引） |

## 论文与技术报告

| 论文/报告 | 相关章节 |
|---|---|
| ReAct: Synergizing Reasoning and Acting in Language Models | Ch 42 |
| Plan-and-Execute (Brown et al.) | Ch 42 |
| Reflexion: Language Agents with Verbal Reinforcement Learning | Ch 42 |
| Retrieval-Augmented Generation (Lewis et al.) | Ch 41 |
| Corrective Retrieval Augmented Generation (CRAG) | Ch 41 |
| KMB Steiner Tree Algorithm (Kou, Markowsky, Berman) | Ch 43 |
| Spider / BIRD NL2SQL Benchmarks | Ch 49 |

## 行业标准与法规

| 标准/法规 | 相关章节 |
|---|---|
| GxP (GMP/GCP/GLP) 数据完整性 | Ch 18, 50 |
| ALCOA+ 数据完整性原则 | Ch 18, 50 |
| PIPL（《个人信息保护法》） | Ch 18, 50 |
| AWS Well-Architected 六大支柱 | Ch 4 |
| Conway 定律 | Ch 1 |

## 主流方案对比参考

| 方案 | 相关章节 | 参考链接 |
|---|---|---|
| :simple-snowflake: Snowflake | Ch 8, 53 | [snowflake.com](https://www.snowflake.com/) |
| :simple-databricks: Databricks Lakehouse | Ch 7, 53 | [databricks.com](https://www.databricks.com/) |
| dbt | Ch 20, 41, 53 | [getdbt.com](https://www.getdbt.com/) |
| Airflow | Ch 10, 33, 53 | [airflow.apache.org](https://airflow.apache.org/) |
| Dagster | Ch 10, 33 | [dagster.io](https://dagster.io/) |
| Hightouch / Census | Ch 39 | [hightouch.com](https://hightouch.com/) |
| Monte Carlo | Ch 51 | [montecarlodata.com](https://www.montecarlodata.com/) |
| ChatGPT Data Analyst | Ch 39 | [openai.com](https://openai.com/) |
| Snowflake Cortex Analyst | Ch 39 | [snowflake.com/cortex](https://www.snowflake.com/data-cloud/ai/cortex/) |
| dbt Semantic Layer | Ch 40 | [getdbt.com/semantic-layer](https://www.getdbt.com/product/semantic-layer) |
| Cube | Ch 40 | [cube.dev](https://cube.dev/) |

---

*本书参考文献仅列出与内容直接相关的资源。书中提到的所有产品/项目名称版权归各自所有者所有。*
