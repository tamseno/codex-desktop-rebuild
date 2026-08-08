#!/usr/bin/env node
/**
 * Smart development startup script
 * Automatically detects system architecture and sets correct CLI path
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const {
  getTarget,
  getStagedResourcePaths,
  resolveCodexVersion,
  resolveVendorRoot,
  stageResources,
} = require('./codex-cli');

// Detect platform and architecture
const platform = process.platform;
const arch = os.arch();

// Priority: staged official CLI from src/ > official npm vendor.
const srcPlatform = platform === 'darwin'
  ? (arch === 'arm64' ? 'mac-arm64' : 'mac-x64')
  : platform === 'win32' ? 'win' : `${platform}-${arch}`;
try {
  getTarget(srcPlatform);
} catch {
  console.error(`Unsupported platform/arch: ${platform}/${arch}`);
  process.exit(1);
}

const projectRoot = path.join(__dirname, '..');
const sourceResourcesDir = path.join(projectRoot, 'src', srcPlatform);
const codexVersion = resolveCodexVersion();
let staged = getStagedResourcePaths(sourceResourcesDir, srcPlatform, codexVersion);
if (!staged) {
  const vendorRoot = resolveVendorRoot(projectRoot, srcPlatform, {
    download: true,
    version: codexVersion,
  });
  stageResources(vendorRoot, sourceResourcesDir, srcPlatform, codexVersion);
  staged = getStagedResourcePaths(sourceResourcesDir, srcPlatform, codexVersion);
}
const cliPath = staged?.cli;

// Verify CLI exists
if (!cliPath || !fs.existsSync(cliPath)) {
  console.error(`CLI not found at: ${cliPath}`);
  console.error('The latest official CLI could not be staged. Run the build or check npm connectivity.');
  process.exit(1);
}

// Resolve app entry: prefer platform-specific _asar/ (has its own package.json)
const appRoot = path.join(sourceResourcesDir, '_asar');
const appEntry = fs.existsSync(appRoot) ? appRoot : projectRoot;

console.log(`[start-dev] Platform: ${platform}, Arch: ${arch}`);
console.log(`[start-dev] Official Codex CLI: ${codexVersion}`);
console.log(`[start-dev] CLI Path: ${cliPath}`);
console.log(`[start-dev] App Root: ${appEntry}`);

// Launch Electron with CLI path
const electronBin = require('electron');
const child = spawn(electronBin, [appEntry], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: {
    ...process.env,
    CODEX_CLI_PATH: cliPath,
    BUILD_FLAVOR: process.env.BUILD_FLAVOR || 'dev',
    ELECTRON_RENDERER_URL: process.env.ELECTRON_RENDERER_URL || 'app://-/index.html',
    CODEX_ELECTRON_RESOURCES_PATH: sourceResourcesDir,
    CODEX_ELECTRON_BUNDLED_PLUGINS_RESOURCES_PATH: sourceResourcesDir,
    CODEX_NODE_REPL_PATH: path.join(sourceResourcesDir, 'node_repl'),
    CODEX_BROWSER_USE_NODE_PATH: path.join(sourceResourcesDir, 'node'),
  },
});

child.on('close', (code) => {
  process.exit(code);
});
