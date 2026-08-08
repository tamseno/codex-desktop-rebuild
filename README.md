# Codex Desktop Rebuild

Cross-platform Electron build for OpenAI Codex Desktop App.

## Supported Platforms

| Platform | Architecture | Status |
|----------|--------------|--------|
| macOS    | x64, arm64   | ✅     |
| Windows  | x64          | ✅     |
| Linux    | x64, arm64   | ✅     |

## Build

```bash
# Install dependencies
npm install

# Build for current platform
npm run build

# Build for specific platform
npm run build:mac-x64
npm run build:mac-arm64
npm run build:win-x64
npm run build:linux-x64
npm run build:linux-arm64

# Build all platforms
npm run build:all
```

## Development

```bash
npm run dev
npm run verify:codex
```

Every build resolves the current official OpenAI Codex CLI from the npm
`@openai/codex@latest` dist-tag, downloads the matching platform package, and
stages its native resources. `verify:codex` checks the resolved CLI version,
app-server support, and the `thread/delete` protocol method. Builds therefore
need npm registry access; use `CODEX_CLI_VERSION` only when a reproducible
version override is required.

```powershell
$env:CODEX_CLI_VERSION = '0.147.0'
npm run build:win-x64
```

## Chrome DevTools MCP

The official Codex CLI does not bundle Chrome DevTools MCP. Codex Desktop and
the CLI read MCP servers from the same user-level `~/.codex/config.toml`. The
desktop build also has its own `node_repl` browser channel; `chrome-devtools`
is an optional, separate MCP server for full Chrome DevTools inspection.

On Windows, register it with the Codex CLI:

```powershell
codex mcp add chrome-devtools `
  --env SystemRoot=C:\Windows `
  --env 'PROGRAMFILES=C:\Program Files' `
  -- cmd /c npx -y chrome-devtools-mcp@latest --no-usage-statistics
```

Then add `startup_timeout_sec = 20` under `[mcp_servers.chrome-devtools]`
when the first `npx` download needs more than the default startup window. Check
the result with `codex mcp list`, then restart Codex Desktop so it reloads the
shared configuration.

## Project Structure

```
├── src/
│   ├── .vite/build/     # Main process (Electron)
│   └── webview/         # Renderer (Frontend)
├── resources/
│   ├── electron.icns    # App icon
│   └── notification.wav # Sound
├── scripts/
│   ├── codex-cli.js      # Official CLI resolution and resource staging
│   ├── verify-codex-cli.js
│   └── patch-copyright.js
├── forge.config.js      # Electron Forge config
└── package.json
```

## CI/CD

GitHub Actions automatically builds on:
- Push to `master`
- Tag `v*` → Creates draft release

## Credits

**© OpenAI**

- [OpenAI Codex](https://github.com/openai/codex) - Official Codex CLI (Apache-2.0)
- [CodexDesktop-Rebuild](https://github.com/Haleclipse/CodexDesktop-Rebuild) - Cross-platform Electron packaging and patches
- [Electron Forge](https://www.electronforge.io/) - Build toolchain

## License

This project repackages the Codex Desktop app for cross-platform distribution.
The bundled Codex CLI is the official OpenAI release selected at build time and is licensed under Apache-2.0.
