# Codex Desktop 重构版

非官方、独立维护的跨平台 Codex 桌面构建项目。

英文版：[README.md](README.md)

本仓库将上游 Codex Desktop 发布包作为输入，再由我们自己的补丁、构建工具、
资源 staging 和 CLI 集成流程生成应用。它是经过修改的独立发行构建，不是上游
项目的原样镜像，也不是简单改名或重新压缩。

## 我们做了什么修改

| 层 | 输入 | 本项目改动 |
|---|---|---|
| 桌面应用 | 上游 Codex Desktop 发布资源 | 提取、应用补丁、重新组装，并保留各平台原生资源。 |
| CLI 后端 | 官方 `@openai/codex` 包 | 将原来的 Cometix 后端替换为官方 OpenAI CLI。 |
| CLI 版本 | npm `@openai/codex@latest` | 构建时解析最新版本，下载对应平台包并校验目标三元组。 |
| 补丁层 | 上游压缩 bundle | 通过 AST 补丁修改国际化、DevTools、Fast mode、插件/浏览器可用性、更新器、强制 sunset 等桌面行为。 |
| 构建系统 | Electron Forge 与平台资源 | 将 `codex`、`rg`、code-mode host、sandbox helper 和配套资源 staging 为干净的发行目录。 |

构建器不使用 `@cometix/codex`。应用内置的后端在构建时从官方 OpenAI npm 包中
选择并校验。

## 支持平台

| 平台 | 架构 | 状态 |
|---|---|---|
| macOS | x64、arm64 | 支持 |
| Windows | x64 | 支持 |
| Linux | x64、arm64 | 支持 |

## 构建要求

- 推荐使用 Node.js 24 和 npm。
- 构建需要访问上游应用下载源和 npm registry。
- macOS 和 Linux 可能需要平台签名与打包工具。Windows 支持 `7zz`、`7z` 或系统自带的 `tar` 回退方案。

## 构建

生成的 `src/` 和 `out/` 目录会被有意忽略。新 clone 的仓库必须先同步上游输入、
再应用本项目补丁，之后才能构建。

### 安装与同步

```bash
npm ci
npm run sync
```

### Windows

```bash
npm run patch:win
npm run build:win-x64
```

### macOS

```bash
npm run patch:mac
npm run build:mac
```

### Linux

Linux 使用 Unix 上游输入，并为目标架构重新构建原生模块。

```bash
npm run sync -- --skip-win
npm run patch:mac
npm run build:linux-x64
# 或
npm run build:linux-arm64
```

### 构建全部支持平台

```bash
npm run build:all
```

普通的 `npm run build` 遵循仓库现有默认行为，构建 macOS arm64。

## 官方 CLI 自动更新

每次构建都会解析当前 `@openai/codex@latest` 标签，下载匹配的平台包，校验其
manifest 和目标三元组，并 staging 官方原生 CLI 资源。官方 npm 发布新版本后，
下一次构建会自动使用新版本。

使用 `verify:codex` 检查解析出的 CLI、app-server 支持以及 `thread/delete` 协议方法。

```bash
npm run verify:codex
```

如需可复现调试或回滚，可设置 `CODEX_CLI_VERSION`。这只是显式覆盖；默认行为仍然
是自动解析最新版本。

```powershell
$env:CODEX_CLI_VERSION = '0.147.0'
npm run build:win-x64
```

## 开发运行

```bash
npm run dev
npm run verify:codex
```

开发启动时，如果本地 staging 版本过期，会先将最新官方 CLI staging 到当前平台资源目录。

## Chrome DevTools MCP

官方 Codex CLI 不会内置 Chrome DevTools MCP。Codex Desktop 和 CLI 通过用户级
`~/.codex/config.toml` 共享 MCP 配置。本桌面构建还提供集成的 `node_repl` 浏览器通道；
`chrome-devtools` 是用于完整 Chrome DevTools 检查的可选独立 MCP server。

在 Windows 上，可使用 Codex CLI 注册：

```powershell
codex mcp add chrome-devtools `
  --env SystemRoot=C:\Windows `
  --env 'PROGRAMFILES=C:\Program Files' `
  -- cmd /c npx -y chrome-devtools-mcp@latest --no-usage-statistics
```

如果首次 `npx` 下载超过默认启动时间，请在 `[mcp_servers.chrome-devtools]` 下增加
`startup_timeout_sec = 20`。使用 `codex mcp list` 检查，然后重启 Codex Desktop。

## 项目结构

```text
src/                    # 生成的上游输入与补丁资源
resources/              # 应用图标与静态资源
scripts/codex-cli.js    # 最新官方 CLI 解析与 staging
scripts/verify-codex-cli.js
                        # CLI 与 app-server 契约验证
scripts/patch-*.js      # AST 与构建后补丁
forge.config.js         # Electron Forge 打包配置
package.json            # 构建命令与元数据
```

## 持续集成与发布

GitHub Actions 可以同步上游输入、应用本仓库补丁、构建所有支持的平台、上传构建
产物并创建 draft release。

- 支持手动 workflow dispatch
- 定时检查上游版本
- macOS x64 与 arm64
- Windows x64
- Linux x64 与 arm64

## 仓库与致谢

- 本仓库：
  [tamseno/codex-desktop-rebuild](https://github.com/tamseno/codex-desktop-rebuild)
- 上游项目参考：
  [Haleclipse/CodexDesktop-Rebuild](https://github.com/Haleclipse/CodexDesktop-Rebuild)
- 官方 CLI：
  [OpenAI Codex](https://github.com/openai/codex)
- 打包工具：
  [Electron Forge](https://www.electronforge.io/)

上游桌面发布资源和官方 OpenAI CLI 仍受其各自许可证及发行条款约束。本仓库包含
我们自己的构建编排、补丁层和集成修改；重新分发前请审阅所有上游条款。
