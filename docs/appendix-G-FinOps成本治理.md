# 附录 G 成本治理与 FinOps

!!! info "面包屑"
    [本书主页](./index.md) › [附录](./appendix-A-术语表与学习地图.md) › 附录 G

---

本书多个地方提到了成本数据（[Ch 1](./01-数字化转型下的医药数据困局.md) 平台经济学、[Ch 47](./47-评估-可观测与持续演进.md) LLM 成本、[Ch 51](./51-价值度量与案例复盘.md) 四维价值），但成本治理是个系统工程——不是光看账单，还包括预算怎么定、异常怎么发现、跨域怎么分摊、优化怎么闭环。这份附录把散在各处的成本相关内容收拢成一套完整的 FinOps 实践。

## FinOps 五环节

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
 B[① 预算制定] --> M[② 监控度量] --> A[③ 异常检测] --> S[④ 跨域分摊] --> O[⑤ 优化闭环]
 O -.->|反馈|B
class B,M,A,S,O bpProcess
classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
classDef bpData fill:#d9fbfb,stroke:#007d79,stroke-width:2px,color:#161616
classDef bpDecision fill:#fcf4d6,stroke:#f1c21b,stroke-width:2px,color:#161616
classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
classDef bpError fill:#fff1f1,stroke:#da1e28,stroke-width:2px,color:#161616
classDef bpExternal fill:#f2f4f8,stroke:#697077,stroke-width:2px,color:#161616
classDef bpUser fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
classDef bpGroup fill:#ffffff,stroke:#0f62fe,stroke-width:2px,color:#161616
linkStyle default stroke:#697077,stroke-width:2px
```

| 环节 | 做法 | 工具 |
|---|---|---|
| **① 预算制定** | 按服务+业务域设月度预算，区分固定（基础设施）与变动（ETL/查询） | AWS Budgets + 标签 |
| **② 监控度量** | 日/周/月成本报告，与预算对比，趋势可视化 | Cost Explorer + CloudWatch 仪表板 |
| **③ 异常检测** | 成本突增超阈值告警（如日花费超 7 天均值 30%） | CloudWatch 异常检测 + SNS |
| **④ 跨域分摊** | 按标签（CostCenter/Domain）分摊成本到业务域，出 chargeback 报告 | AWS Cost Allocation Tags |
| **⑤ 优化闭环** | 定期 review，识别浪费 → 优化 → 验证节省 | infracost + 手动 review |

## 标签策略：跨域分摊的基础

跨域分摊的前提是**所有资源打标签**——这是 [Ch 22](./22-核心基础设施仓库设计.md) 治理层"标签策略"的落点。没有标签，成本根本分不到业务域头上：

```hcl
# 示意：Terraform 强制标签策略（所有资源必须打这三类标签）
locals {
  common_tags = {
    Environment   = var.environment          # dev/qa/prod
    CostCenter    = var.cost_center          # ma/sci/retail/platform
    Owner         = "aurora-cdp"
    ManagedBy     = "terraform"
  }
}
resource "aws_glue_job" "this" {
  # ...
  tags = local.common_tags                   # 核心意图：无标签资源不计费、不可上线
}
```

| 标签 | 用途 | 示例值 |
|---|---|---|
| `Environment` | 区分环境成本 | dev/qa/prod |
| `CostCenter` | 分摊到业务域 | ma/sci/retail/platform |
| `Owner` | 资源归属 | aurora-cdp |
| `ManagedBy` | 管理方式（IaC vs 手动） | terraform/manual |

## 成本异常检测

成本突增往往是配置出错的信号——Glue Job 的 DPU 调高忘记调回来了、Redshift RPU 弹性扩容没缩回去、S3 上堆了大量没清理的中转文件。异常检测能在账单出来之前先把这些问题揪出来：

```python
# 示意：成本异常检测（日花费与 7 天均值对比）
def detect_cost_anomaly(service: str, today_spend: float) -> bool:
    baseline = avg_daily_spend(service, days=7)
    # 核心意图：超基线 30% 即告警，宁可多报不漏报
    if today_spend > baseline * 1.3:
        notify(f"⚠️ {service} 今日花费 {today_spend}¥ 超 7 天均值 {baseline}¥ 30%")
        return True
    return False
```

## infracost 集成：CI 中的成本门禁

在 :simple-terraform: Terraform 的 CI 里集成 infracost，能在 `plan` 阶段就估算出成本变化——PR 里自动 comment 月度成本 delta，超预算直接标红：

```yaml
# 示意：GitHub Actions 中 infracost 集成（plan 后输出成本 delta）
- name: Run infracost
  run: |
    infracost breakdown --path . --format json --out-file infracost.json
    infracost comment github --path infracost.json \
      --repo ${{ github.repository }} --pull-request ${{ github.event.pull_request.number }} \
      --behavior update
# PR comment 自动显示："本次变更预估月成本 +¥1,200（+8%），主要来自 Redshift 节点升级"
```

!!! warning "Trade-off"
    infracost 只能估 Terraform 管的那部分资源的成本。运行时费用（Glue 实际吃了多少 DPU-hour、Lambda 调了多少次）估不出来。所以 infracost 是"配置变更成本门禁"，运行时异常还得靠前面的异常检测兜底。两者互补。

## 优化清单：分服务的成本优化手段

| 服务 | 浪费信号 | 优化手段 | 预期节省 |
|---|---|---|---|
| **S3** | Landing 层文件超 30 天未转 Glacier | 生命周期策略自动转 Glacier/Deep Archive | 40-60% |
| **Redshift** | 夜间/周末 RPU 利用率 <20% | Serverless 弹性 RPU（日间高/夜间低） | 30-50% |
| **Glue** | Job 平均 DPU 利用率 <50% | 降 max_dpus + 优化分区并行度 | 20-30% |
| **Lambda** | 平均执行内存远超实际使用 | 按 CloudWatch 内存指标下调配置 | 10-20% |
| **Step Functions** | Standard 工作流用于高频短任务 | 改 Express 工作流（按调用次数而非状态转换计费） | 50-70% |

!!! tip "引申"
    FinOps 不是一次搞定就完事了，是持续治理。平台规模在长，昨天的最优配置今天可能就变成浪费。每季度做一次成本 review，对着优化清单逐个服务过一遍。本书平台最大的一笔节省来自 Redshift 从 Provisioned 切到 Serverless——夜间 RPU 从固定 24 节点降到 32 RPU，一个月少花大概 ¥15,000。这种优化你不定期 review 根本发现不了。

---

!!! quote "回到"
    [本书主页](./index.md) —— FinOps 是数据平台运营的持续课题。回到主页选择其他章节，或查看 [附录 D 参考文献](./appendix-D-参考文献与延伸阅读.md) 中 FinOps 相关资料。
