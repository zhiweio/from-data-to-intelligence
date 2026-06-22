---
name: review-and-rewrite-all
description: >
  对全书全部章节（不含前言/致谢/附录）依次进行 review + rewrite 的完整循环。
  先调用 review-chapter 审查一章，若任何小节未达到阈值，立即调用 rewrite-section 重写，
  重写完成后重新审查确认通过，然后进入下一章。全程不间断，直到全书覆盖完毕。
  Use when user says "全量审查重写", "review and rewrite all", "全书review", "从头到尾检查",
  or uses loop-related terms with review/rewrite.
---

# /review-and-rewrite-all

对《从数据到智能》全书全部内容章节进行**全量、连续、不间断**的审查与重写循环。

## 核心原则

**一次一章，审查→重写→确认→下一章，不停顿。** 这不是"审查完所有章节再重写"，而是"每一章审查发现的问题立即修复"——因为修复后的内容可能影响后续章节的衔接判断。

## 执行模式

这是一个**连续循环**，不是一次性批处理。工作方式如下：

```
Part I 开始
  → Ch 1: 审查 → 发现 3 节未通过 → 重写 3 节 → 确认通过 → Ch 1 完成 ✅
  → Ch 2: 审查 → 发现 2 节未通过 → 重写 2 节 → 确认通过 → Ch 2 完成 ✅
  → Ch 3: 审查 → 全部通过 → 无需重写 → Ch 3 完成 ✅
Part I 完成 🎉 (进度 3/53)
  → Ch 4: 审查 → ...
...
全书完成 🎉 或用户中断
```

**关键行为**：
- 一章完成后**立即**进入下一章，**不询问用户是否继续**（除非遇到需要用户决策的阻断性问题）
- 每一章的审查结果和重写日志持久保存到 `.claude/review-results/` 和 `.claude/rewrite-logs/`
- 如果会话因 token 限制被截断，下次启动时从 `.claude/rewrite-progress.json` 读取进度，自动续接

## 使用方式

```
/review-and-rewrite-all                     # 从 Ch 1 开始覆盖全书
/review-and-rewrite-all --from Ch 20        # 从指定章节开始
/review-and-rewrite-all --from Part VII     # 从指定 Part 开始
/review-and-rewrite-all --resume            # 从上次中断处恢复
/review-and-rewrite-all --dry-run           # 只审查不重写，生成全量审查报告
```

## 执行流程

### Step 0 — 初始化与进度恢复

**首次执行**：
1. 确保输出目录存在：
   ```bash
   mkdir -p .claude/review-results .claude/rewrite-logs
   ```
2. 初始化进度文件 `.claude/rewrite-progress.json`：
   ```json
   {
     "started": "2026-06-22T00:00:00+08:00",
     "status": "in_progress",
     "mode": "review-and-rewrite",
     "strategy": "full-loop",
     "target": "Ch 1-Ch 52",
     "current_chapter": 1,
     "current_part": "Part I",
     "completed": [],
     "skip_list": ["00-preface", "53-致谢与团队", "appendix-*"],
     "stats": {
       "chapters_reviewed": 0,
       "chapters_passed_first_review": 0,
       "sections_reviewed": 0,
       "sections_failed": 0,
       "sections_rewritten": 0,
       "total_rewrites": 0
     }
   }
   ```

**续接恢复** (`--resume`)：
- 读取 `.claude/rewrite-progress.json`
- 如果 `status` 为 `"completed"`，报告"全书完成"并退出
- 如果 `status` 为 `"in_progress"`，从 `current_chapter` 开始继续
- 如果进度文件不存在，提示用户从头开始

### Step 1 — 加载当前章内容并审查 (review-chapter 逻辑)

对当前 `current_chapter` 执行与 `review-chapter` 技能完全相同的审查流程：

1. **读取该章完整内容**（必须完整读取，不可摘要）
2. **解析所有 H2/H3 节结构**（跳过 `## :material-school:`、`## :material-check-circle:` 等元数据节）
3. **逐节评分**：按 D1-D5 五维度（内容深度/图文平衡/叙事逻辑/上下文衔接/实践视角），0–20 分
4. **对照核心主旨**：检查是否触达 M1-M12 核心母题、是否符合该 Part 的叙事密度要求
5. **判定**：
   - 总分 ≥ 70 且 单项均 ≥ 10 → ✅ 通过
   - 否则 → ❌ 需重写

**审查输出**：为当前章节输出一个简要的审查结果（不需要完整的 Markdown 表格），格式如下：

```
Ch N 审查结果 (3/5 节通过, 2/5 节需重写)
  ✅ §N.1 [标题] — 78分 (D1:16 D2:17 D3:15 D4:14 D5:16)
  ❌ §N.3 [标题] — 48分 (D1:8 D2:10 D3:10 D4:9 D5:11) → 核心问题: 图+表罗列，无深入分析
  ❌ §N.5 [标题] — 55分 (D1:12 D2:11 D3:10 D4:12 D5:10) → 核心问题: 叙事薄弱，缺少第一人称
  ✅ §N.2 [标题] — 82分
  ✅ §N.4 [标题] — 75分
→ 需重写 §N.3, §N.5 — 立即开始
```

**如果该章全部通过**：标记该章为 completed，跳至 Step 4。

### Step 2 — 重写未通过的小节 (rewrite-section 逻辑)

对每一个未通过的小节，执行与 `rewrite-section` 技能完全相同的重写流程：

**2a 上下文梳理**：
- 读取整章 + 前后章首/尾 80-200 行（理解叙事位置）
- 确认该节所在 Part 的叙事密度要求
- 确认该节应触达的核心母题（从 M1-M12 中选 2-3 个最相关的）

**2b 知识补充（硬性要求）**：
- 至少使用 Context7 查询 2 次（`mcp__context7__resolve-library-id` → `mcp__context7__query-docs`）
- 至少使用 DeepWiki 查询 1 次（`mcp__cognitionai_deepwiki__ask_question`）
- 查询的技术主题根据该节内容自动确定

**2c 执行重写**：
- 用 Edit 工具替换目标 H3 节下的内容
- 保持格式约定（AGENT.md）
- 注入第一人称、trade-off 分析、核心母题共振
- 通过"重写后自检清单"8 条检查

**2d 同步更新**：
- 如有 Mermaid 图变更 → 更新 `meta/mermaid-catalog.md`
- 如有表格变更 → 更新 `meta/table-catalog.md`

**2e 重写日志**：
- 保存重写前后对比到 `.claude/rewrite-logs/Ch-N-§X.Y-{timestamp}.md`

### Step 3 — 重审确认（Re-review）

重写完成后，对该节进行**快速重审**（不需要完整的五维度打分，只需确认）：

- 是否达到了五个维度的最小标准？
- 是否与核心母题产生了共振？
- 是否注入了第一人称？

**快速重审判定**：
- ✅ 确认通过 → 该节通过，继续重写下一节
- ❌ 仍需改进 → 再次修改直到通过，但**单个节最多重写 3 次**：
  - 第 1 次重写：标准深度重写
  - 第 2 次重写：针对遗留问题聚焦修改
  - 第 3 次重写：仍然未通过 → 标记为 `⚠️ 让步通过`，记录原因，继续前进
  - **原因**：有些节可能因结构性问题（如该章本身叙事定位为"参考速查"型）不适合注入大量第一人称叙事——强迫重写到完美反而会破坏全书的结构节奏

### Step 4 — 章完成与进度推进

该章所有节通过后：

1. 更新 `.claude/rewrite-progress.json`：
   - 将 `current_chapter` 递增到下一章
   - 将完成的章添加到 `completed` 列表
   - 更新 `stats`
2. 更新 `current_part`（如果章号跨越了 Part 边界）
3. 运行 `uv run mkdocs build --strict`（至少每 Part 完成后运行一次，或每 5 章运行一次）

### Step 5 — 循环前进

**立即加载下一章，回到 Step 1。** 不询问用户，不暂停。

**唯一的阻断点**：
- `uv run mkdocs build --strict` 失败 → 停止并报告，要求用户介入
- 连续 5 个章节全部通过无重写 → 报告进度但继续（不是错误）

### Step 6 — 全书完成

当 `current_chapter` 超过 52 时：

1. 更新进度文件 status 为 `"completed"`
2. 运行最终 `uv run mkdocs build --strict`
3. 输出全量统计报告

## 全量统计报告格式（全书完成后）

```markdown
# 📊 全书审查与重写完成报告

**完成时间**：2026-06-22 ~ 2026-06-2X
**总耗时**：约 XX 小时（实际挂钟时间）

## 总体统计

| 指标 | 数值 |
|---|---|
| 审查章节数 | 50 |
| 审查小节总数 | 247 |
| 首次审查通过数 | 156 (63%) |
| 需重写小节数 | 91 (37%) |
| 重写后通过数 | 88 |
| 让步通过数 | 3 |
| 重写成功率 | 96.7% |

## 各 Part 统计

| Part | 章节数 | 小节数 | 通过 | 重写 | 通过率 |
|---|---|---|---|---|---|
| Part I 起点 | 3 | ... | ... | ... | ... |
| Part II 架构设计 | 8 | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... |

## 重写量最大的章节 Top 5

| 章节 | 需重写小节数 | 最高优先级问题 |
|---|---|---|
| ... | ... | ... |

## 让步通过清单

| 章节 | 小节 | 让步原因 |
|---|---|---|
| ... | ... | ... |
```

## 进度追踪规范

### 进度文件 (`.claude/rewrite-progress.json`) 完整结构

```json
{
  "started": "ISO timestamp",
  "last_updated": "ISO timestamp",
  "status": "in_progress | completed | paused",
  "mode": "review-and-rewrite",
  "strategy": "full-loop",
  "current_chapter": 15,
  "current_part": "Part III",
  "completed": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  "skip_list": [],
  "current_chapter_failures": [
    {"section": "15.3", "score": 52, "rewrite_attempts": 1, "status": "in_progress"}
  ],
  "stats": {
    "chapters_reviewed": 14,
    "chapters_passed_first_review": 5,
    "sections_reviewed": 68,
    "sections_failed": 23,
    "sections_rewritten": 20,
    "sections_conceded": 0,
    "total_rewrite_attempts": 21
  },
  "part_summaries": {
    "Part I": {
      "chapters": [1, 2, 3],
      "sections_reviewed": 18,
      "sections_failed": 3,
      "sections_rewritten": 3,
      "status": "completed"
    }
  }
}
```

### Part 边界（自动识别）

| 当前章 | Part | 状态切换点 |
|---|---|---|
| Ch 1-3 完成 | Part I → Part II | 打印 "🎉 Part I 完成 (3/53 章, 进度 6%)" |
| Ch 4-11 完成 | Part II → Part III | 打印 "🎉 Part II 完成 (11/53, 21%)" |
| Ch 12-20 完成 | Part III → Part IV | 打印 "🎉 Part III 完成 (20/53, 38%)" |
| Ch 21-30 完成 | Part IV → Part V | 打印 "🎉 Part IV 完成 (30/53, 57%)" |
| Ch 31-34 完成 | Part V → Part VI | 打印 "🎉 Part V 完成 (34/53, 64%)" |
| Ch 35-37 完成 | Part VI → Part VII | 打印 "🎉 Part VI 完成 (37/53, 70%)" |
| Ch 38-47 完成 | Part VII → Part VIII | 打印 "🎉 Part VII 完成 (47/53, 89%)" |
| Ch 48-52 完成 | 全书完成 | 打印 "🎉 全书审查与重写完成！" |

## 执行纪律

### 1. 永不自动跳过

即使某章"看起来没问题"，也必须完整阅读和评分的审查流程。不能因为"上次看过感觉没问题"就跳过。

### 2. 重写质量不可妥协

重写必须满足以下所有条件才算通过：
- 五个维度每项 ≥ 10 分
- 总分 ≥ 70 分
- 至少与 1 个核心母题（M1-M12）产生共振
- 包含至少 1 处 trade-off 分析（适用章节）
- 包含至少 1 处第一人称叙事（适用章节）
- 通过"重写后自检清单"

### 3. 让步通过必须有书面理由

如果一个小节经过 3 次重写仍不达标，标记为"让步通过"时必须在重写日志中写明：
- 为什么不继续改了？
- 该节的定位是否本质上是"参考速查"型（不适合深度叙事）？
- 如果是，是否应该将该节移入附录？

### 4. 构建验证不能少

每 Part 完成后运行 `uv run mkdocs build --strict`。构建失败必须立即处理。

### 5. 进度文件实时更新

每章完成（Step 4）后立即更新 `.claude/rewrite-progress.json`。**不要攒到"等会儿一起写"**——因为会话可能在任何时候被截断，进度文件是恢复的唯一切入点。

## 会话中断后的恢复

如果会话因 token 限制被截断，用户只需在新的会话中说：

```
/review-and-rewrite-all --resume
```

技能将：
1. 读取 `.claude/rewrite-progress.json`
2. 检查 `status` 和 `current_chapter`
3. 如果 `current_chapter_failures` 非空 → 说明中断时正在重写某个节的中间
4. 如果有未完成的重写 → 检查 `.claude/rewrite-logs/` 是否已有保存的对比
5. 从断点继续执行

## 注意事项

1. **这是大工程**：全书约 50 章，预估 200-300 个小节。如果 30% 需要重写，就是 60-90 个小节需要逐节深度重写——每个需要 Context7×2 + DeepWiki×1 + Edit。总 token 消耗可能非常高（数十万到百万级）。
2. **用户可在任何时刻中断**：虽然本技能设计为"不允许停止中断"的连续循环，但用户始终可以通过取消/中断来控制。进度文件确保中断后可以从断点恢复。
3. **附录不审查**：appendix-A 到 G 不参与审查流程（它们是参考工具，不是叙事章节）。
4. **Ch 00 前言和 Ch 53 致谢不审查**：前言已精心打磨，致谢是个人的，不适合自动化审查。
5. **--dry-run 模式**：如果用户不确定，建议先 `--dry-run` 跑一遍全量审查，看看大概有多少节需要重写，评估工作量后再决定是否执行完整 review-and-rewrite。
