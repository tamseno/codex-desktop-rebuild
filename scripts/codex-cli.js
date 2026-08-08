"use strict";

/**
 * Resolve and stage the official OpenAI Codex CLI for the target platform.
 *
 * The npm package contains a small JavaScript launcher plus optional native
 * platform packages. The desktop app embeds the native files directly in its
 * resources directory, so this module also flattens the package resources to
 * the layout expected by the upstream desktop app.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const OFFICIAL_CODEX_PACKAGE = "@openai/codex";
const CODEX_VERSION_ENV = "CODEX_CLI_VERSION";
const CODEX_LATEST_TAG = "latest";
let cachedLatestVersion = null;

const TARGETS = Object.freeze({
  "mac-arm64": {
    suffix: "darwin-arm64",
    packageDirectory: "codex-darwin-arm64",
    triple: "aarch64-apple-darwin",
    cliName: "codex",
    rgName: "rg",
    codeModeHostName: "codex-code-mode-host",
  },
  "mac-x64": {
    suffix: "darwin-x64",
    packageDirectory: "codex-darwin-x64",
    triple: "x86_64-apple-darwin",
    cliName: "codex",
    rgName: "rg",
    codeModeHostName: "codex-code-mode-host",
  },
  win: {
    suffix: "win32-x64",
    packageDirectory: "codex-win32-x64",
    triple: "x86_64-pc-windows-msvc",
    cliName: "codex.exe",
    rgName: "rg.exe",
    codeModeHostName: "codex-code-mode-host.exe",
  },
  "linux-x64": {
    suffix: "linux-x64",
    packageDirectory: "codex-linux-x64",
    triple: "x86_64-unknown-linux-musl",
    cliName: "codex",
    rgName: "rg",
    codeModeHostName: "codex-code-mode-host",
  },
  "linux-arm64": {
    suffix: "linux-arm64",
    packageDirectory: "codex-linux-arm64",
    triple: "aarch64-unknown-linux-musl",
    cliName: "codex",
    rgName: "rg",
    codeModeHostName: "codex-code-mode-host",
  },
});

function getTarget(platform) {
  const target = TARGETS[platform];
  if (!target) {
    throw new Error(`Unsupported Codex target platform: ${platform}`);
  }
  return target;
}

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function isDirectory(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function validateCodexVersion(value, source) {
  const version = String(value || "").trim();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Invalid Codex CLI version from ${source}: ${version || "<empty>"}`);
  }
  return version;
}

function parseVersionOutput(output) {
  try {
    const parsed = JSON.parse(output);
    if (typeof parsed === "string") return parsed;
    if (parsed && typeof parsed.version === "string") return parsed.version;
  } catch {
    // Some npm versions emit the scalar without JSON quoting.
  }
  return String(output).match(/\b\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?\b/)?.[0] || null;
}

function resolveCodexVersion() {
  const override = process.env[CODEX_VERSION_ENV];
  if (override) return validateCodexVersion(override, CODEX_VERSION_ENV);
  if (cachedLatestVersion) return cachedLatestVersion;

  const latestSpec = `${OFFICIAL_CODEX_PACKAGE}@${CODEX_LATEST_TAG}`;
  console.log(`   [codex] resolving ${latestSpec}`);
  let output;
  try {
    output = execFileSync(
      npmExecutable(),
      ["view", latestSpec, "version", "--json"],
      {
        cwd: process.cwd(),
        encoding: "utf-8",
        shell: process.platform === "win32",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
  } catch (error) {
    throw new Error(`Unable to resolve ${latestSpec}: ${error.message}`);
  }

  const version = parseVersionOutput(output);
  cachedLatestVersion = validateCodexVersion(version, `${latestSpec} version`);
  console.log(`   [codex] latest official version: ${cachedLatestVersion}`);
  return cachedLatestVersion;
}

function isOfficialVendorRoot(vendorRoot, target, version) {
  const manifestPath = path.join(vendorRoot, "codex-package.json");
  if (!isFile(manifestPath) || !isFile(path.join(vendorRoot, "bin", target.cliName))) {
    return false;
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    return manifest.version === version && manifest.target === target.triple;
  } catch {
    return false;
  }
}

function getVendorRoot(projectRoot, platform, version) {
  const target = getTarget(platform);
  const packageRoots = [
    path.join(projectRoot, "node_modules", "@openai", target.packageDirectory),
    path.join(projectRoot, "node_modules", "@openai", "codex"),
  ];

  for (const packageRoot of packageRoots) {
    const vendorRoot = path.join(packageRoot, "vendor", target.triple);
    if (isOfficialVendorRoot(vendorRoot, target, version)) {
      return vendorRoot;
    }
  }
  return null;
}

function npmExecutable() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function parsePackResult(output) {
  try {
    const result = JSON.parse(output);
    const entry = Array.isArray(result) ? result[result.length - 1] : result;
    if (entry?.filename) return entry.filename;
  } catch {
    // Older npm versions may ignore --json. Fall back to the final output line.
  }

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .pop();
}

function downloadVendorRoot(platform, version) {
  const target = getTarget(platform);
  const packDir = path.join(
    os.tmpdir(),
    "openai-codex-pack",
    version,
    target.suffix,
  );
  const extractDir = path.join(packDir, "extracted");
  const vendorRoot = path.join(extractDir, "package", "vendor", target.triple);

  if (isOfficialVendorRoot(vendorRoot, target, version)) {
    return vendorRoot;
  }

  fs.mkdirSync(packDir, { recursive: true });
  const spec = `${OFFICIAL_CODEX_PACKAGE}@${version}-${target.suffix}`;
  console.log(`   [vendor] fetching ${spec}`);

  const output = execFileSync(
    npmExecutable(),
    ["pack", spec, "--pack-destination", packDir, "--json"],
    {
      cwd: packDir,
      encoding: "utf-8",
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const archiveName = parsePackResult(output);
  if (!archiveName) {
    throw new Error(`npm pack did not return an archive for ${spec}`);
  }

  if (isDirectory(extractDir)) {
    fs.rmSync(extractDir, { recursive: true, force: true });
  }
  fs.mkdirSync(extractDir, { recursive: true });
  execFileSync("tar", ["-xzf", path.join(packDir, archiveName), "-C", extractDir], {
    stdio: "pipe",
  });

  if (!isOfficialVendorRoot(vendorRoot, target, version)) {
    throw new Error(`Official Codex package is incomplete or mismatched for ${target.triple}`);
  }
  return vendorRoot;
}

function resolveVendorRoot(
  projectRoot,
  platform,
  { download = true, version = resolveCodexVersion() } = {},
) {
  const localRoot = getVendorRoot(projectRoot, platform, version);
  if (localRoot) return localRoot;
  return download ? downloadVendorRoot(platform, version) : null;
}

function getVendorPaths(vendorRoot, platform) {
  const target = getTarget(platform);
  return {
    cli: path.join(vendorRoot, "bin", target.cliName),
    codeModeHost: path.join(vendorRoot, "bin", target.codeModeHostName),
    rg: path.join(vendorRoot, "codex-path", target.rgName),
    packageManifest: path.join(vendorRoot, "codex-package.json"),
    resourcesDir: path.join(vendorRoot, "codex-resources"),
  };
}

function makeExecutable(filePath) {
  if (process.platform !== "win32") {
    try { fs.chmodSync(filePath, 0o755); } catch {}
  }
}

function copyFile(source, destination, executable = true) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  if (executable) makeExecutable(destination);
}

function copyTreeContents(sourceDir, destinationDir, copied) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const source = path.join(sourceDir, entry.name);
    const destination = path.join(destinationDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destination, { recursive: true });
      copyTreeContents(source, destination, copied);
    } else if (!entry.isSymbolicLink()) {
      copyFile(source, destination, !entry.name.endsWith(".json"));
      copied.push(destination);
    }
  }
}

/**
 * Copy the official package's native CLI and companion resources into the
 * flat resources directory used by the desktop app.
 */
function stageResources(vendorRoot, destinationDir, platform, version = resolveCodexVersion()) {
  const target = getTarget(platform);
  if (!isOfficialVendorRoot(vendorRoot, target, version)) {
    throw new Error(`Official Codex vendor is incomplete or mismatched for ${target.triple}`);
  }
  const paths = getVendorPaths(vendorRoot, platform);
  const requiredFiles = [
    [paths.cli, "Codex CLI"],
    [paths.codeModeHost, "code-mode host"],
    [paths.rg, "ripgrep"],
    [paths.packageManifest, "Codex package manifest"],
  ];
  for (const [filePath, label] of requiredFiles) {
    if (!isFile(filePath)) {
      throw new Error(`Official ${label} not found: ${filePath}`);
    }
  }
  if (!isDirectory(paths.resourcesDir)) {
    throw new Error(`Official Codex resources directory not found: ${paths.resourcesDir}`);
  }

  const copied = [];
  copyFile(paths.cli, path.join(destinationDir, path.basename(paths.cli)));
  copied.push(path.join(destinationDir, path.basename(paths.cli)));

  for (const requiredPath of [paths.codeModeHost, paths.rg]) {
    copyFile(requiredPath, path.join(destinationDir, path.basename(requiredPath)));
    copied.push(path.join(destinationDir, path.basename(requiredPath)));
  }

  copyFile(paths.packageManifest, path.join(destinationDir, "codex-package.json"), false);
  copied.push(path.join(destinationDir, "codex-package.json"));
  copyTreeContents(paths.resourcesDir, destinationDir, copied);

  return {
    cliPath: path.join(destinationDir, path.basename(paths.cli)),
    copied,
  };
}

function getStagedResourcePaths(resourcesDir, platform, version = resolveCodexVersion()) {
  const target = getTarget(platform);
  const paths = {
    cli: path.join(resourcesDir, target.cliName),
    codeModeHost: path.join(resourcesDir, target.codeModeHostName),
    rg: path.join(resourcesDir, target.rgName),
    packageManifest: path.join(resourcesDir, "codex-package.json"),
    resourcesDir,
  };
  if (!isFile(paths.cli) || !isFile(paths.packageManifest)) return null;
  try {
    const manifest = JSON.parse(fs.readFileSync(paths.packageManifest, "utf-8"));
    return manifest.version === version && manifest.target === target.triple ? paths : null;
  } catch {
    return null;
  }
}

function getBundledCliPath(resourcesDir, platform, version = resolveCodexVersion()) {
  return getStagedResourcePaths(resourcesDir, platform, version)?.cli || null;
}

module.exports = {
  OFFICIAL_CODEX_PACKAGE,
  CODEX_LATEST_TAG,
  CODEX_VERSION_ENV,
  TARGETS,
  getBundledCliPath,
  getStagedResourcePaths,
  getTarget,
  getVendorPaths,
  resolveCodexVersion,
  resolveVendorRoot,
  stageResources,
};
