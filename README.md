# Codex Desktop Rebuild / Codex Desktop 重构版

Unofficial, independently maintained cross-platform desktop build for Codex.
非官方、独立维护的跨平台 Codex 桌面构建项目。

This repository uses an upstream Codex Desktop release as an input artifact,
then applies our own patches, build tooling, resource staging, and CLI
integration. It is a modified distribution, not a verbatim upstream mirror
and not a simple rename or repackaging project.

本仓库将上游 Codex Desktop 发布包作为输入，再由我们自己的补丁、构建工具、
资源 staging 和 CLI 集成流程生成应用。它是经过修改的独立发行构建，不是上游
项目的原样镜像，也不是简单改名或重新压缩。

## What We Changed / 我们做了什么修改

| Layer / 层 | Input / 输入 | Our work / 本项目改动 |
|---|---|---|
| Desktop app / 桌面应用 | Upstream Codex Desktop release assets / 上游 Codex Desktop 发布资源 | Extract, patch, repack, and preserve platform-specific native resources. / 提取、应用补丁、重新组装，并保留各平台原生资源。 |
| CLI backend / CLI 后端 | Official `@openai/codex` package / 官方 `@openai/codex` 包 | Replaced the former Cometix backend with the official OpenAI CLI. / 将原来的 Cometix 后端替换为官方 OpenAI CLI。 |
| CLI versioning / CLI 版本 | npm `@openai/codex@latest` / npm 最新标签 | Resolve the latest version at build time, download the matching platform package, and verify its target triple. / 构建时解析最新版本，下载对应平台包并校验 target triple。 |
| Patch layer / 补丁层 | Minified upstream bundles / 上游压缩 bundle | Apply AST-based changes for i18n, DevTools, Fast mode, plugin/browser availability, updater behavior, sunset gating, and other desktop behavior. / 通过 AST 补丁修改国际化、DevTools、Fast mode、插件/浏览器可用性、更新器、强制 sunset 等桌面行为。 |
| Build system / 构建系统 | Electron Forge plus platform artifacts / Electron Forge 与平台资源 | Stage `codex`, `rg`, code-mode host, sandbox helpers, and companion resources into a clean distributable layout. / 将 `codex`、`rg`、code-mode host、sandbox helper 和配套资源 staging 为干净的发行目录。 |

The builder does not use `@cometix/codex`. The bundled backend is selected from
the official OpenAI npm package at build time.

构建器不使用 `@cometix/codex`。应用内置的后端在构建时从官方 OpenAI npm 包中
选择并校验。

## Supported Platforms / 支持平台

| Platform / 平台 | Architecture / 架构 | Status / 状态 |
|---|---|---|
| macOS | x64, arm64 | Supported / 支持 |
| Windows | x64 | Supported / 支持 |
| Linux | x64, arm64 | Supported / 支持 |

## Requirements / 构建要求

- Node.js 24 and npm are recommended. / 推荐使用 Node.js 24 和 npm。
- The build needs access to the upstream app download source and the npm
  registry. / 构建需要访问上游应用下载源和 npm registry。
- Platform-native signing and packaging tools may be required for macOS and
  Linux. Windows uses `7zz`, `7z`, or the built-in `tar` fallback. / macOS 和
  Linux 可能需要平台签名与打包工具；Windows 支持 `7zz`、`7z` 或系统自带的
  `tar` 回退方案。

## Build / 构建

The generated `src/` and `out/` directories are intentionally ignored. A fresh
clone must sync the upstream input and apply our patches before building.

生成的 `src/` 和 `out/` 目录会被有意忽略。新 clone 的仓库必须先同步上游输入、
再应用本项目补丁，之后才能构建。

### Install and sync / 安装与同步

```bash
npm ci
npm run sync
```

### Windows / Windows

```bash
npm run patch:win
npm run build:win-x64
```

### macOS / macOS

```bash
npm run patch:mac
npm run build:mac
```

### Linux / Linux

Linux uses the Unix upstream input and rebuilds native modules for the selected
architecture.

Linux 使用 Unix 上游输入，并为目标架构重新构建原生模块。

```bash
npm run sync -- --skip-win
npm run patch:mac
npm run build:linux-x64
# or / 或：
npm run build:linux-arm64
```

### All supported builds / 构建全部平台

```bash
npm run build:all
```

The plain `npm run build` command follows the repository's existing default and
builds macOS arm64.

普通的 `npm run build` 遵循仓库现有默认行为，构建 macOS arm64。

## Automatic Official CLI Updates / 官方 CLI 自动更新

Every build resolves the current `@openai/codex@latest` dist-tag, downloads the
matching platform package, validates its manifest and target triple, and stages
the official native CLI resources. A new official npm release is therefore used
automatically on the next build.

每次构建都会解析当前 `@openai/codex@latest` 标签，下载匹配的平台包，校验其
manifest 和 target triple，并 staging 官方原生 CLI 资源。官方 npm 发布新版本
后，下一次构建会自动使用新版本。

Use `verify:codex` to check the resolved CLI, app-server support, and the
`thread/delete` protocol method.

使用 `verify:codex` 检查解析出的 CLI、app-server 支持以及
`thread/delete` 协议方法。

```bash
npm run verify:codex
```

For reproducible debugging or rollback, set `CODEX_CLI_VERSION`. This is an
explicit exception; the default remains automatic latest resolution.

如需可复现调试或回滚，可设置 `CODEX_CLI_VERSION`。这只是显式覆盖；默认行为
仍然是自动解析最新版本。

```powershell
$env:CODEX_CLI_VERSION = '0.147.0'
npm run build:win-x64
```

## Development / 开发运行

```bash
npm run dev
npm run verify:codex
```

Development startup stages the latest official CLI into the local platform
resource directory when the existing staged copy is out of date.

开发启动时，如果本地 staging 版本过期，会先将最新官方 CLI staging 到当前平台
资源目录。

## Chrome DevTools MCP / Chrome DevTools MCP

The official Codex CLI does not bundle Chrome DevTools MCP. Codex Desktop and
the CLI share MCP configuration through the user-level `~/.codex/config.toml`.
The desktop build also has its own integrated `node_repl` browser channel;
`chrome-devtools` is an optional separate MCP server for full Chrome DevTools
inspection.

官方 Codex CLI 不会内置 Chrome DevTools MCP。Codex Desktop 和 CLI 通过用户级
`~/.codex/config.toml` 共享 MCP 配置。本桌面构建还提供集成的 `node_repl` 浏览器
通道；`chrome-devtools` 是用于完整 Chrome DevTools 检查的可选独立 MCP server。

On Windows, register it with Codex CLI:

在 Windows 上，可使用 Codex CLI 注册：

```powershell
codex mcp add chrome-devtools `
  --env SystemRoot=C:\Windows `
  --env 'PROGRAMFILES=C:\Program Files' `
  -- cmd /c npx -y chrome-devtools-mcp@latest --no-usage-statistics
```

Add `startup_timeout_sec = 20` under `[mcp_servers.chrome-devtools]` if the
first `npx` download needs more than the default startup window. Check with
`codex mcp list`, then restart Codex Desktop.

如果首次 `npx` 下载超过默认启动时间，请在
`[mcp_servers.chrome-devtools]` 下增加 `startup_timeout_sec = 20`。使用
`codex mcp list` 检查，然后重启 Codex Desktop。

## Project Structure / 项目结构

```text
src/                    # Generated upstream input and patched resources / 生成的上游输入与补丁资源
resources/              # App icons and static resources / 应用图标与静态资源
scripts/codex-cli.js    # Latest official CLI resolution and staging / 最新官方 CLI 解析与 staging
scripts/verify-codex-cli.js
                        # CLI/app-server contract verification / CLI 与 app-server 契约验证
scripts/patch-*.js      # AST and post-build patches / AST 与构建后补丁
forge.config.js         # Electron Forge packaging / Electron Forge 打包配置
package.json            # Build commands and metadata / 构建命令与元数据
```

## CI/CD / 持续集成与发布

GitHub Actions can synchronize upstream inputs, apply this repository's patch
set, build all supported targets, upload artifacts, and create draft releases.

GitHub Actions 可以同步上游输入、应用本仓库补丁、构建所有支持的平台、上传构建
产物并创建 draft release。

- Manual workflow dispatch / 支持手动 workflow dispatch
- Scheduled upstream check / 定时检查上游版本
- macOS x64 and arm64 / macOS x64 与 arm64
- Windows x64 / Windows x64
- Linux x64 and arm64 / Linux x64 与 arm64

## Repository and Credits / 仓库与致谢

- This repository / 本仓库:
  [tamseno/codex-desktop-rebuild](https://github.com/tamseno/codex-desktop-rebuild)
- Upstream project reference / 上游项目参考:
  [Haleclipse/CodexDesktop-Rebuild](https://github.com/Haleclipse/CodexDesktop-Rebuild)
- Official CLI / 官方 CLI:
  [OpenAI Codex](https://github.com/openai/codex)
- Packaging tool / 打包工具:
  [Electron Forge](https://www.electronforge.io/)

The upstream desktop release assets and the official OpenAI CLI retain their
own licenses and distribution terms. This repository contains our build
orchestration, patch layer, and integration changes; review all upstream terms
before redistribution.

上游桌面发布资源和官方 OpenAI CLI 仍受其各自许可证及发行条款约束。本仓库包含
我们自己的构建编排、补丁层和集成修改；重新分发前请审阅所有上游条款。
