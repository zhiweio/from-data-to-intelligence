# AGENT.md

本文件为 AI 编码代理（coding agent）提供本项目的约定与工作规则，补充 `README.md` 之外、代理在改动书籍内容时必须遵守的约束。本仓库只维护一本书——《从数据到智能：企业级数据平台的构建、演进与 Agentic BI 实践》，发布到 GitHub Pages。

## 项目概述

- **内容形态**：基于 mkdocs-material 构建的单本技术书籍，非软件项目。
- **书籍内容**：`docs/` 下的 Markdown 文件（`index.md`、`00-preface.md`、`01-…53-*.md`、`appendix-A…G.md`）。
- **作者参考文件**：`meta/` 下的索引/速查表，不参与站点构建（不在 `docs_dir` 内），包括 `mermaid-catalog.md`、`table-catalog.md`、`blueprint-theme.md`。
- **自定义资源**：`docs/javascripts/blueprint-icons.js`（Mermaid 图标包注册）、`docs/stylesheets/figure-caption.css`（图表标题/表格样式）。

## 构建与校验命令

```bash
uv sync                              # 安装依赖
uv run mkdocs serve                  # 本地预览 http://127.0.0.1:8000
uv run mkdocs build --strict         # 构建到 site/，--strict 与 CI 一致（任何告警即失败）
```

任何内容改动后，提交前必须通过 `uv run mkdocs build --strict`。

## 内容编写作风

- 用简体中文撰写；保持现有章节的格式约定：H1 章标题、`!!! info "面包屑"` 导航框、`!!! abstract` 项目阶段框、`## :material-school: 本章你将学到` 学习目标。
- 图表标题用 `<p class="caption" markdown="span">**图 X-Y** ...</p>` / `**表 X-Y** ...`，与 `figure-caption.css` 配合。
- 章节内交叉引用一律用 `./` 同级相对链接（如 `[Ch 4](./04-平台五层模型与设计哲学.md)`），不要用绝对路径或 `../`。
- Mermaid 图遵循 Blueprint 设计系统（IBM Carbon 配色 + C4 分层），见 `meta/blueprint-theme.md`。

## 必须遵守的规则

### 规则 1 — Mermaid 图变更须同步 `meta/mermaid-catalog.md`

任何书籍内容更新如果涉及 Mermaid 图——包括新增、删除、修改描述、以及**顺序调整**——都要同步更新 `meta/mermaid-catalog.md`。

- 目录格式：每章一节，表格列出 `图 X-Y`（X=章号，Y=本章序号）、类型（如 `flowchart TB`）、描述；每章标注「图表数量」小计；每 Part 标注「N 章 \| M 个图表」；顶部「统计总览」按图表类型汇总数量与占比。
- 顺序调整时务必重排受影响章节的图号（`图 X-Y` 的 Y 按文中出现顺序连续编号），并同步更新小计与总览统计。
- 当前基线：全书 334 个 Mermaid 图表，分布在 54 个章节。

### 规则 2 — 表格变更须同步 `meta/table-catalog.md`

任何书籍内容更新如果涉及表格——包括新增、删除、修改描述、以及**顺序调整**——都要同步更新 `meta/table-catalog.md`。

- 目录格式：每章一节，表格列出 `表 X-Y`、描述；每章标注「表格数量」小计；每 Part 标注「N 章 \| M 个表格」；顶部「统计总览」给出全书总数与分布。
- 顺序调整时务必重排受影响章节的表号（`表 X-Y` 的 Y 按文中出现顺序连续编号），并同步更新小计与总览统计。
- 当前基线：全书 255 个表格，分布在 54 个章节。

### 规则 3 — 新增 Mermaid 配图须调用 `mermaid-illustrate` 技能

任何书籍内容编写更新时，如果需要做 Mermaid 配图（新增图表，或重绘/优化现有图表），**必须**调用 `mermaid-illustrate` 技能进行绘图优化，不得手写未经该技能校验的 Mermaid 代码。

- 该技能强制 Blueprint 设计系统（IBM Carbon v11 配色 + C4 分层）、语义化 `classDef`（`bpProcess`/`bpData`/`bpDecision` 等）、禁用 emoji、图标优先。
- 调用流程：识别图表类型 → 加载 `examples/design-system.md` 与匹配的示例文件 → 按类型支持矩阵应用样式 → 生成合法 Mermaid 代码。
- 产出的 Mermaid 代码内联到对应章节 Markdown 的 ```mermaid 代码块中；同时按规则 1 同步 `meta/mermaid-catalog.md`。
