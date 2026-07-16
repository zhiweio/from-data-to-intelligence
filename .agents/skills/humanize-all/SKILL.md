---
name: humanize-all
description: >
  对全书全部章节（含前言/致谢/附录）依次进行去 AI 写作痕迹处理。
  逐章调用 humanizer-zh 进行深度检测和修复，全程不间断循环直到全书覆盖完毕。
  Use when user says "全书去AI味", "humanize all chapters", "去除AI痕迹", "humanize全书".
---

# /humanize-all

对《从数据到智能》全书全部章节（共 53 章 + 7 附录 + 前言 = 61 个文件）进行**连续、不间断**的去 AI 写作痕迹处理。

**运行时**：兼容 Claude Code 与 Cursor。工具名对照见 [COMPAT.md](../COMPAT.md)。调用 `humanizer-zh` 时：Claude 用 `Skill` 工具；Cursor 先 `Read` 其 `SKILL.md` 再按说明处理文本。

## 核心原则

**humanize-all = 循环调度器 + 文件 I/O + 进度管理。humanizer-zh 技能 = 检测引擎 + 重写引擎。**

每一章的处理流程是：humanize-all 读取章节 → 分块 → 逐块**调用 `humanizer-zh` 技能**进行深度检测和修复 → humanize-all 写回文件 → 保存日志 → 进下一章。

**关键：humanize-all 本身不做任何检测和重写。全部委托给 `humanizer-zh` 技能。** 这是与上一版的本质区别。

## 为什么需要这个技能

本书定位是**首席解决方案架构师的第一人称手记**——文本必须读起来像"真人的深度思考"，而非"AI 生成的技术文档"。任何 AI 写作痕迹（夸大的象征意义、宣传性语言、三段式法则、破折号过度使用、AI 高频词汇）都会严重损害"第一人称手记"的可信度。

`humanizer-zh` 技能基于维基百科 WikiProject AI Cleanup 维护的 24 项检测模式，是专业的 AI 痕迹检测和重写引擎。`humanize-all` 负责把它规模化——覆盖全书 61 个文件。

## 使用方式

```
/humanize-all                     # 从 Ch 1 开始覆盖全书（含前言/附录）
/humanize-all --from Ch 20        # 从指定章节开始
/humanize-all --from Part VII     # 从指定 Part 开始
/humanize-all --resume            # 从上次中断处恢复
/humanize-all --only Part VII     # 只处理指定 Part
/humanize-all --dry-run           # 只检测不修改，生成全量 AI 痕迹检测报告
```

## 执行流程

### 三步协作模型

```
humanize-all（调度器）              humanizer-zh（检测+重写引擎）
     │                                      │
     ├─ 读取章节全文                         │
     ├─ 跳过保护区域后，分块                  │
     │                                      │
     ├── 调用 humanizer-zh ──────→         检测 24 项模式
     │  （Claude: Skill / Cursor: Read     识别 AI 痕迹
     │   SKILL.md 后按说明执行）            重写问题段落
     │  ←── 返回人性化文本 ─────            注入真实语调
     │                                      │
     ├─ 将重写后文本拼回原文件               │
     ├─ 保存日志，更新进度                   │
     │                                      │
     ├─ 加载下一章，重复                      │
```

### Step 0 — 初始化与进度恢复

**首次执行**：
```bash
mkdir -p .claude/humanize-logs
```

初始化 `.claude/humanize-progress.json`：
```json
{
  "started": "ISO timestamp",
  "status": "in_progress",
  "target": "Ch 0-Ch 53 + Appendix A-G",
  "current_chapter": 1,
  "current_part": "Part I",
  "completed": [],
  "stats": {
    "chapters_processed": 0,
    "chapters_clean": 0,
    "chapters_modified": 0,
    "total_chunks_processed": 0,
    "total_patterns_found": 0
  }
}
```

**续接恢复** (`--resume`)：读取进度文件，从 `current_chapter` 继续。

### Step 1 — 读取章节全文并分块

1. **读取该章完整内容**
2. **识别保护区域**——以下内容提取出来单独保存，不送入 humanizer-zh（它们不是叙事文本，不能改动）：
   - Mermaid 代码块（`` ```mermaid ... ``` ``）
   - 代码块（`` ```yaml `` / `` ```python `` / `` ```bash `` / `` ```json `` / `` ```terraform `` 等）
   - 面包屑导航（`!!! info "面包屑"`）
   - 项目阶段框（`!!! abstract "项目第N年..."`）
   - 章首学习目标（`## :material-school: 本章你将学到` 及其下的列表）
   - 图/表标题行（`<p class="caption" ...>` 和 `**表 X-Y** ...`）
   - 纯 Markdown 链接（`[text](url)` 独占一行的情况）
   - 水平线（`---`）

3. **将剩余正文按 H3 小节分块**。每一块的具体内容：
   - 该 H3 小节下（从 `### X.Y 标题` 到下一个 `###` 或 `##` 之前）的所有正文段落
   - 包括该节内的 `!!! tip` / `!!! warning` / `!!! quote` 等 Admonition 框的**正文内容**（保留框类型和标题，只 humanize 框内文字）

4. **构建 humanizer-zh 调用上下文**：包含章节编号、该节在全书叙事弧中的定位（Part、项目年份），传递给 humanizer-zh 以确保修复不丢失本书的叙事声音。

### Step 2 — 调用 humanizer-zh 技能进行深度处理（核心步骤）

**对每个文本块，必须通过 humanizer-zh 处理。** 这是强制要求——humanize-all 自身不做检测和重写。

#### 调用方式（按运行时）

| 运行时 | 如何调用 humanizer-zh |
|---|---|
| Claude Code | 使用 `Skill` 工具：`skill: "humanizer-zh"`，args 为下方 prompt 模板 |
| Cursor | `Read` 用户级技能文件（优先 `~/.agents/skills/humanizer-zh/SKILL.md`，其次 `~/.claude/skills/` / `~/.cursor/skills/` 下同名路径），按其说明对文本块执行检测与重写；将下方 prompt 模板作为处理指令一并遵循 |

#### 每次调用时向 humanizer-zh 传递的 prompt 模板

```
对以下书籍章节文本进行去 AI 化处理。

【书籍背景】
- 书名：《从数据到智能：企业级数据平台的构建、演进与 Agentic BI 实践》
- 定位：首席解决方案架构师的第一人称手记，不是教科书，不是工具手册
- 叙事声音：第一人称"我"（NorthPeak Consulting 驻场 Aurora Pharma 的首席架构师）
- 写作理念：讲设计不讲实现、讲 trade-off 不讲银弹、讲演进不讲终点、讲叙事不讲干货罗列

【当前章节上下文】
- 章节：[Ch N §X.Y 节标题]
- 项目阶段：[第 N 年 · 阶段名称]
- 所属 Part：[Part 名称]
- 叙事定位：[根据该 Part 的定位填写，如 Part VII 是全书最高价值的创新点]

【处理要求】
1. 按照 humanizer-zh 的全部 24 项检测模式逐项扫描
2. 对检测到的 AI 痕迹进行重写修复。重写原则：删除填充词、打破公式结构、变化句子节奏、信任读者、删除金句
3. **特别保护以下内容**：
   - 第一人称叙事（"我在 Aurora 遇到…""我当时选了 X 而非 Y 因为…""后来回头看…"）——保持不动
   - 跨行业经验迁移（"我在专利数据/企业征信领域…"）——保持不动
   - 技术术语的准确性——谨慎改动，不确定则保留
   - Material Icons 标记（:material-xxx: / :simple-xxx: / :octicons-xxx: / :fontawesome-xxx:）——完全不动
4. 修复后的文本应该读起来像"一个做了八年数据工程的架构师的深思熟虑的笔记"，而不是"AI 生成的技术文档"
5. 质量目标：humanizer-zh 质量评分 ≥ 40/50

【需要处理的文本】
[文本块内容]
```

#### 每章的调用次数

- 如果该章有 5 个 H3 小节，则调用 5 次 humanizer-zh（每个小节一次）
- 如果某个 H3 小节内容过长（>2000 字），可将其拆分为 2 个文本块分别处理
- **所有 humanizer-zh 调用必须在同一轮（同一个 tool call batch）中发出**——不要等一个返回再发下一个

#### 对 humanizer-zh 返回结果的验证

收到 humanizer-zh 返回结果后，快速检查：
- ✅ 返回了处理后的文本且字数没有膨胀（通常应略短或持平）
- ✅ 技术术语没有明显错误
- ✅ 第一人称"我"没有被改掉
- ❌ 如果返回的文本读起来仍有浓重 AI 味（如仍然有"此外""至关重要""奠定了坚实基础"）→ **重新调用 humanizer-zh**，在 prompt 中明确标注上次未消除的模式
- ❌ 如果返回的文本长度膨胀了 50% 以上 → 可能是在"扩写"而非"修复"，重新调用并强调"去 AI 化应该让文本更短，不是更长"

每个文本块最多调用 humanizer-zh 2 次。2 次仍不理想 → 标记为 `⚠️ 让步接受`，记录原因，继续。

### Step 3 — 拼回原文并写回文件

1. 将 humanizer-zh 处理后的文本块拼回原文中对应的位置
2. 保持保护区域内容不变
3. 保持 Markdown 格式完整（标题层级、列表、链接语法）
4. 用 Write 工具将完整内容写回原文件

### Step 4 — 保存日志与进度

每章处理完后立即更新：
1. `.claude/humanize-logs/Ch-N-{timestamp}.md` — 记录检测到的主要模式、修改处数、让步接受项
2. `.claude/humanize-progress.json` — 更新 current_chapter 和 stats

### Step 5 — 循环前进

**立即加载下一章，回到 Step 1。** 不询问用户，不暂停。

### Step 6 — 全书完成

1. 更新进度文件 status 为 `"completed"`
2. 运行 `uv run mkdocs build --strict`
3. 输出全量统计报告

## 覆盖范围

全书 61 个文件按以下顺序处理：

| 序号 | 范围 | 文件数 | 累计进度 |
|---|---|---|---|
| 1 | Ch 0 前言 | 1 | 1/61 (2%) |
| 2 | Part I (Ch 1–3) | 3 | 4/61 (7%) |
| 3 | Part II (Ch 4–11) | 8 | 12/61 (20%) |
| 4 | Part III (Ch 12–20) | 9 | 21/61 (34%) |
| 5 | Part IV (Ch 21–30) | 10 | 31/61 (51%) |
| 6 | Part V (Ch 31–34) | 4 | 35/61 (57%) |
| 7 | Part VI (Ch 35–37) | 3 | 38/61 (62%) |
| 8 | Part VII (Ch 38–47) | 10 | 48/61 (79%) |
| 9 | Part VIII (Ch 48–52) | 5 | 53/61 (87%) |
| 10 | Ch 53 致谢 | 1 | 54/61 (89%) |
| 11 | 附录 A–G | 7 | 61/61 (100%) |

**Part 边界里程碑**：每完成一个 Part 打印进度。

## 日志示例（每章处理后记录）

```markdown
# Ch 27 Humanize 日志
**时间**：2026-06-22T14:30:00+08:00
**章节**：Ch 27 CI/CD：可复用工作流平台
**Part**：Part IV 基础设施
**项目阶段**：第 1 年 · 核心建设期

## 处理摘要
- H3 小节数：3 个 (§27.1, §27.2, §27.3)
- humanizer-zh 调用次数：3 次
- 退改次数：1 次（§27.1 首次返回仍有 AI 味，退改后通过）

## 各节结果
### §27.1 GitHub Actions reusable workflows + custom actions 两层架构
- 检测到模式：P1(AI词汇: "此外"2处) P2(破折号: 1处) P7(宣传性: "强大的"1处)
- humanizer-zh 质量评分：42/50
- 结果：✅ 通过

### §27.2 自托管 runner 与容器化执行环境
- 检测到模式：P10(填充短语: 2处)
- humanizer-zh 质量评分：46/50
- 结果：✅ 通过

### §27.3 变更检测驱动的增量 CI
- 检测到模式：P15(通用积极结论: 1处) P10(填充: 1处)
- humanizer-zh 质量评分：44/50
- 结果：✅ 通过
```

## 全量统计报告格式（完成后）

```markdown
# 📊 全书去 AI 化完成报告

**完成时间**：2026-06-22 ~ 2026-06-2X

## 总体统计

| 指标 | 数值 |
|---|---|
| 处理文件数 | 61 |
| humanizer-zh 总调用次数 | XXX |
| 首次调用通过率 | XX% |
| 退改率 | XX% |
| 让步接受数 | X |
| 零修改章节数 | X |

## 高频模式 Top 5

| 模式 | 发现次数 | 占比 |
|---|---|---|
| P1 AI高频词汇 | XXX | XX% |
| ... | ... | ... |

## 各 Part 统计

| Part | 文件数 | 检测段落数 | 修改段落数 | 让步数 |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |
```

## 执行纪律

### 1. 所有检测和重写必须通过 humanizer-zh 技能

**humanize-all 本身不做检测、不做重写。** 每个文本块必须经由 `humanizer-zh` 处理（Claude: `Skill` 工具；Cursor: Read 其 SKILL.md 后执行）。没有例外。

### 2. 保护区域不可触碰

以下内容不送入 humanizer-zh，保持原始不动：
- Mermaid 代码块、代码块
- 面包屑导航、项目阶段框、章首学习目标
- 图/表标题格式行（`<p class="caption">`、`**表 X-Y**`）
- 纯链接导航行

### 3. 叙事声音保护优先

如果 humanizer-zh 返回的文本丢失了第一人称"我"的叙事声音，必须退改——在 prompt 中明确标注"保持第一人称叙事声音不动"。

### 4. 进度实时更新

每章完成立即更新 `.claude/humanize-progress.json`。

### 5. 构建验证

每完成一个 Part 运行 `uv run mkdocs build --strict`。

### 6. 长章节分块策略

| 章节行数 | 分块策略 |
|---|---|
| < 200 行 | 整章作为一个块（一次调用） |
| 200–500 行 | 按 H3 小节分块（每小节一次调用） |
| > 500 行 | 按 H3 小节分块，>2000 字的节再拆半 |

## 会话中断后的恢复

```
/humanize-all --resume
```

自动从 `.claude/humanize-progress.json` 读取进度并继续。

## --dry-run 模式

只检测不修改。逐章读取 → 分块送入 humanizer-zh 检测 → 收集检测结果但不写回文件 → 生成全量 AI 痕迹分布报告。

## 注意事项

1. **这不是内容重写**：去 AI 化是措辞打磨，不改技术内容、不改章节结构。
2. **humanizer-zh 是唯一的检测和重写引擎**：humanize-all 只负责调度、文件 I/O、进度管理。
3. **每章调用的 humanizer-zh 实例独立**：每次调用是独立的，不影响其他章节。
4. **长文本分块是必需的**：humanizer-zh 擅长处理段落级文本，整章全文丢进去效果不佳。必须分块。
5. **退改机制防止无限循环**：每个文本块最多调用 humanizer-zh 2 次，2 次仍不理想 → 让步接受。
