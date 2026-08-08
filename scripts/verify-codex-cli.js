#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const {
  getStagedResourcePaths,
  getVendorPaths,
  resolveCodexVersion,
  resolveVendorRoot,
} = require("./codex-cli");

const PROJECT_ROOT = path.join(__dirname, "..");

function currentTarget() {
  if (process.platform === "win32" && process.arch === "x64") return "win";
  if (process.platform === "darwin" && process.arch === "arm64") return "mac-arm64";
  if (process.platform === "darwin" && process.arch === "x64") return "mac-x64";
  if (process.platform === "linux" && process.arch === "arm64") return "linux-arm64";
  if (process.platform === "linux" && process.arch === "x64") return "linux-x64";
  throw new Error(`Unsupported host platform: ${process.platform}/${process.arch}`);
}

function listFiles(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(fullPath));
    else if (!entry.isSymbolicLink()) files.push(fullPath);
  }
  return files;
}

function readSchemaText(root) {
  return listFiles(root)
    .filter((filePath) => filePath.endsWith(".json"))
    .map((filePath) => fs.readFileSync(filePath, "utf-8"))
    .join("\n");
}

function main() {
  const target = currentTarget();
  const codexVersion = resolveCodexVersion();
  const stagedRoots = [
    path.join(PROJECT_ROOT, "src", target),
    path.join(PROJECT_ROOT, "src"),
  ];
  let paths = null;
  for (const resourcesDir of stagedRoots) {
    paths = getStagedResourcePaths(resourcesDir, target, codexVersion);
    if (paths) break;
  }
  if (!paths) {
    const vendorRoot = resolveVendorRoot(PROJECT_ROOT, target, {
      download: true,
      version: codexVersion,
    });
    paths = getVendorPaths(vendorRoot, target);
  }

  for (const [label, filePath] of [
    ["CLI", paths.cli],
    ["code-mode host", paths.codeModeHost],
    ["ripgrep", paths.rg],
    ["package manifest", paths.packageManifest],
  ]) {
    if (!fs.statSync(filePath).isFile()) throw new Error(`Missing ${label}: ${filePath}`);
  }
  if (!fs.statSync(paths.resourcesDir).isDirectory()) {
    throw new Error(`Missing Codex resources directory: ${paths.resourcesDir}`);
  }

  const version = execFileSync(paths.cli, ["--version"], {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  const expectedVersion = `codex-cli ${codexVersion}`;
  if (version !== expectedVersion) {
    throw new Error(`Unexpected Codex CLI version: ${version}; expected ${expectedVersion}`);
  }

  const help = execFileSync(paths.cli, ["app-server", "--help"], {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (!help.includes("codex app-server")) {
    throw new Error("Official Codex CLI does not expose app-server");
  }

  const schemaDir = fs.mkdtempSync(path.join(os.tmpdir(), "codex-app-server-schema-"));
  try {
    execFileSync(paths.cli, ["app-server", "generate-json-schema", "--out", schemaDir], {
      stdio: "pipe",
    });
    if (!readSchemaText(schemaDir).includes('"thread/delete"')) {
      throw new Error("Official app-server schema does not expose thread/delete");
    }
  } finally {
    fs.rmSync(schemaDir, { recursive: true, force: true });
  }

  console.log(`Official Codex CLI verified: ${target} ${version} (latest ${codexVersion})`);
}

try {
  main();
} catch (error) {
  console.error(`[x] ${error.message}`);
  process.exit(1);
}
