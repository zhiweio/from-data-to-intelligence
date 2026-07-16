# 从数据到智能：企业级数据平台的构建、演进与 Agentic BI 实践

<p align="center">
  <img src="docs/images/cover.png" alt="本书封面" width="360" />
</p>

<p align="center">
  <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans"><img src="https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-orange" alt="License: CC BY-NC-SA 4.0"></a>
  <a href="https://github.com/zhiweio/from-data-to-intelligence/actions/workflows/docs.yml"><img src="https://img.shields.io/github/actions/workflow/status/zhiweio/from-data-to-intelligence/docs.yml?label=build&logo=github-actions&color=brightgreen" alt="Build Status"></a>
  <img src="https://img.shields.io/badge/Made%20with-MkDocs%20Material-blue?logo=materialformkdocs" alt="MkDocs Material">
  <img src="https://img.shields.io/badge/Chapters-55-blueviolet" alt="55 Chapters">
  <img src="https://img.shields.io/badge/Language-简体中文-blue" alt="Language: Chinese">
</p>

> 一个数据开发的八年数据工程手记：从 0 到 1 构建企业级医药数据平台，再到 Data + AI 转型下的 Agentic BI。

**在线阅读**：<https://zhiweio.github.io/from-data-to-intelligence/>

---

## 关于本书

这是一本面向**数据工程师、平台架构师与 AI 应用工程师**的实践型技术专著。作者以首席解决方案架构师的第一人称视角，完整记录了一座企业级医药数据平台从无到有、从数据到智能的演进全过程。

全书 8 部分 55 章 + 7 附录，聚焦设计思想与架构 trade-off，图文并茂——书中没有止步于"怎么做"，而是着重回答"**为什么这么做、当时有什么约束、对比主流方案如何取舍**"。代码会过时，而架构思想历久弥新。

> ⚠️ **虚构声明**：为保护商业隐私，书中所有公司、人员、系统标识均为虚构（甲方 Aurora Pharma、乙方 NorthPeak Consulting）。详见[前言](docs/00-preface.md)。

---

## 仓库结构

```
.
├─ docs/                       # 书籍内容（Markdown 源文件）
│  ├─ index.md                 # 书主页：依赖总览 + 阅读路径 + 目录
│  ├─ 00-preface.md            # 前言
│  ├─ 01-…55-*.md              # 正文 55 章
│  ├─ appendix-A…G.md          # 7 个附录
│  ├─ stylesheets/             # 自定义样式（图表标题、表格居中等）
│  └─ javascripts/             # 自定义脚本（Mermaid 图标包注册）
├─ meta/                       # 作者参考文件（不参与站点构建）
├─ mkdocs.yml                  # MkDocs Material 配置
├─ pyproject.toml              # 依赖声明（uv 管理）
└─ .github/workflows/docs.yml  # GitHub Pages 自动部署
```

## 本地预览

本项目使用 [uv](https://docs.astral.sh/uv/) 管理依赖，无需手动安装 Python 包。

```bash
uv sync                              # 安装依赖
uv run mkdocs serve                  # 启动本地预览 http://127.0.0.1:8000
uv run mkdocs build --strict         # 构建到 site/（--strict 与 CI 一致）
```

## 自动部署

推送到 `main` 分支时，GitHub Actions 会自动构建并以 `--strict` 模式校验，通过后部署到 GitHub Pages。配置见 [`.github/workflows/docs.yml`](.github/workflows/docs.yml)。

## 技术栈

| 组件 | 说明 |
|---|---|
| [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) | 文档主题与站点生成 |
| [Mermaid](https://mermaid.js.org/) + Blueprint 图标系统 | 架构图、流程图渲染（含 Iconify 图标包） |
| [pymdown-extensions](https://facelessuser.github.io/pymdown-extensions/) | Markdown 扩展（admonition、tabbed、superfences 等） |

## 贡献

发现内容有误或有改进建议？欢迎提交 [Issue](https://github.com/zhiweio/from-data-to-intelligence/issues) 或 Pull Request。提交的贡献将按相同许可发布。

## 许可证

本项目采用 [**CC BY-NC-SA 4.0**（署名-非商业性使用-相同方式共享 4.0 国际）](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans) 许可协议。

- **署名（BY）**：必须给出适当署名（作者：zhiweio）、提供指向本许可协议的链接，同时标明是否对原始内容做了修改。
- **非商业性使用（NC）**：不得将本作品用于商业目的。
- **相同方式共享（SA）**：基于本作品演绎的内容须按[相同的许可协议](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans)发布。

完整法律文本见 [LICENSE](LICENSE)。
