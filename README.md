# Codex Desktop Rebuild

Unofficial, independently maintained cross-platform desktop build for Codex.

Read this document in English or open the [Simplified Chinese README](README.zh-CN.md).

This repository uses an upstream Codex Desktop release as an input artifact,
then applies our own patches, build tooling, resource staging, and CLI
integration. It is a modified distribution, not a verbatim upstream mirror
and not a simple rename or repackaging project.

## What We Changed

| Layer | Input | Our work |
|---|---|---|
| Desktop app | Upstream Codex Desktop release assets | Extract, patch, repack, and preserve platform-specific native resources. |
| CLI backend | Official `@openai/codex` package | Replaced the former Cometix backend with the official OpenAI CLI. |
| CLI versioning | npm `@openai/codex@latest` | Resolve the latest version at build time, download the matching platform package, and verify its target triple. |
| Patch layer | Minified upstream bundles | Apply AST-based changes for i18n, DevTools, Fast mode, plugin/browser availability, updater behavior, sunset gating, and other desktop behavior. |
| Build system | Electron Forge plus platform artifacts | Stage `codex`, `rg`, code-mode host, sandbox helpers, and companion resources into a clean distributable layout. |

The builder does not use `@cometix/codex`. The bundled backend is selected from
the official OpenAI npm package at build time.

## Supported Platforms

| Platform | Architecture | Status |
|---|---|---|
| macOS | x64, arm64 | Supported |
| Windows | x64 | Supported |
| Linux | x64, arm64 | Supported |

## Requirements

- Node.js 24 and npm are recommended.
- The build needs access to the upstream app download source and the npm registry.
- Platform-native signing and packaging tools may be required for macOS and Linux.
  Windows uses `7zz`, `7z`, or the built-in `tar` fallback.

## Build

The generated `src/` and `out/` directories are intentionally ignored. A fresh
clone must sync the upstream input and apply our patches before building.

### Install and sync

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

Linux uses the Unix upstream input and rebuilds native modules for the selected
architecture.

```bash
npm run sync -- --skip-win
npm run patch:mac
npm run build:linux-x64
# or
npm run build:linux-arm64
```

### All supported builds

```bash
npm run build:all
```

The plain `npm run build` command follows the repository's existing default and
builds macOS arm64.

## Automatic Official CLI Updates

Every build resolves the current `@openai/codex@latest` dist-tag, downloads the
matching platform package, validates its manifest and target triple, and stages
the official native CLI resources. A new official npm release is therefore used
automatically on the next build.

Use `verify:codex` to check the resolved CLI, app-server support, and the
`thread/delete` protocol method.

```bash
npm run verify:codex
```

For reproducible debugging or rollback, set `CODEX_CLI_VERSION`. This is an
explicit exception; the default remains automatic latest resolution.

```powershell
$env:CODEX_CLI_VERSION = '0.147.0'
npm run build:win-x64
```

## Development

```bash
npm run dev
npm run verify:codex
```

Development startup stages the latest official CLI into the local platform
resource directory when the existing staged copy is out of date.

## Chrome DevTools MCP

The official Codex CLI does not bundle Chrome DevTools MCP. Codex Desktop and
the CLI share MCP configuration through the user-level `~/.codex/config.toml`.
The desktop build also has its own integrated `node_repl` browser channel;
`chrome-devtools` is an optional separate MCP server for full Chrome DevTools
inspection.

On Windows, register it with Codex CLI:

```powershell
codex mcp add chrome-devtools `
  --env SystemRoot=C:\Windows `
  --env 'PROGRAMFILES=C:\Program Files' `
  -- cmd /c npx -y chrome-devtools-mcp@latest --no-usage-statistics
```

Add `startup_timeout_sec = 20` under `[mcp_servers.chrome-devtools]` if the
first `npx` download needs more than the default startup window. Check with
`codex mcp list`, then restart Codex Desktop.

## Project Structure

```text
src/                    # Generated upstream input and patched resources
resources/              # App icons and static resources
scripts/codex-cli.js    # Latest official CLI resolution and staging
scripts/verify-codex-cli.js
                        # CLI and app-server contract verification
scripts/patch-*.js      # AST and post-build patches
forge.config.js         # Electron Forge packaging
package.json            # Build commands and metadata
```

## CI/CD

GitHub Actions can synchronize upstream inputs, apply this repository's patch
set, build all supported targets, upload artifacts, and create draft releases.

- Manual workflow dispatch
- Scheduled upstream check
- macOS x64 and arm64
- Windows x64
- Linux x64 and arm64

## Repository and Credits

- This repository:
  [tamseno/codex-desktop-rebuild](https://github.com/tamseno/codex-desktop-rebuild)
- Upstream project reference:
  [Haleclipse/CodexDesktop-Rebuild](https://github.com/Haleclipse/CodexDesktop-Rebuild)
- Official CLI:
  [OpenAI Codex](https://github.com/openai/codex)
- Packaging tool:
  [Electron Forge](https://www.electronforge.io/)

The upstream desktop release assets and the official OpenAI CLI retain their
own licenses and distribution terms. This repository contains our build
orchestration, patch layer, and integration changes; review all upstream terms
before redistribution.
