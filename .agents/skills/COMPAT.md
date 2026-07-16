# Agent Runtime Compatibility

本仓库 skills 同时服务 **Claude Code** 与 **Cursor**。权威副本在 `.agents/skills/`；`.claude/skills` 与 `.cursor/skills` 均为指向此处的符号链接。

运行时产物（审查结果、重写日志、进度文件）统一写在 `.claude/` 下（已 gitignore），两边共用，便于续跑。

## 工具对照

| 能力 | Claude Code | Cursor |
|---|---|---|
| 编辑文件局部 | `Edit` | `StrReplace` |
| 整文件写入 | `Write` | `Write` |
| 读取文件 | `Read` | `Read` |
| 调用子技能 | `Skill` 工具（如 `humanizer-zh`） | `Read` 对应 `SKILL.md` 并按其说明执行 |
| Context7 文档 | `mcp__context7__resolve-library-id` / `mcp__context7__query-docs` | `GetMcpTools` → `CallMcpTool`，server 含 `context7`，tools: `resolve-library-id` / `query-docs` |
| DeepWiki | `mcp__cognitionai_deepwiki__ask_question` | `CallMcpTool`，server `user-cognitionai/deepwiki`（或同名 deepwiki），tool: `ask_question` |

## 调用原则

1. **先探测再调用**：Cursor 侧先用 `GetMcpTools` 确认 server/tool 名称与参数 schema，再 `CallMcpTool`。
2. **语义等价**：无论工具名如何，必须完成技能要求的同等查询次数与质量门槛。
3. **子技能路径**：`humanizer-zh` 通常在用户级 `~/.agents/skills/humanizer-zh/SKILL.md`（或 `~/.claude/skills/humanizer-zh/`、`~/.cursor/skills/humanizer-zh/`）。先找已安装路径再执行。
4. **触发方式**：两边均可 `/skill-name` 或自然语言触发（如「审查章节」「全书去AI味」）。
