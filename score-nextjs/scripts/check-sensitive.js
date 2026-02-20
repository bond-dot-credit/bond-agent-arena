#!/usr/bin/env node

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const mode = process.argv.includes("--push")
  ? "push"
  : process.argv.includes("--tracked")
    ? "tracked"
    : "staged";

const blockedFilePatterns = [
  /^\.env(\..+)?$/i,
  /(^|\/)\.env(\..+)?$/i,
  /(^|\/).*\.pem$/i,
  /(^|\/).*\.key$/i,
  /(^|\/)(id_rsa|id_dsa|id_ed25519)(\.pub)?$/i,
  /(^|\/)(credentials|secrets?)\.(json|ya?ml|toml|ini)$/i,
];

const secretValuePatterns = [
  /THIRDWEB_SECRET_KEY\s*=\s*.+/i,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*.+/i,
  /SUPABASE_JWT_SECRET\s*=\s*.+/i,
  /NEXT_PUBLIC_THIRDWEB_CLIENT_ID\s*=\s*.+/i,
  /AGENTS_SUPABASE_ANON_KEY\s*=\s*.+/i,
  /AKIA[0-9A-Z]{16}/,
  /(?:api[-_ ]?key|secret|token|private[-_ ]?key)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{20,}/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/,
];

function run(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}

function getCandidateFiles() {
  if (mode === "push") {
    try {
      const output = run("git diff --name-only --diff-filter=ACMR @{upstream}...HEAD");
      return output ? output.split("\n").filter(Boolean) : [];
    } catch {
      const output = run("git diff --name-only --diff-filter=ACMR HEAD~1..HEAD");
      return output ? output.split("\n").filter(Boolean) : [];
    }
  }

  if (mode === "tracked") {
    const output = run("git ls-files");
    return output ? output.split("\n").filter(Boolean) : [];
  }
  const output = run("git diff --cached --name-only --diff-filter=ACMR");
  return output ? output.split("\n").filter(Boolean) : [];
}

function isBinary(buffer) {
  const max = Math.min(buffer.length, 8000);
  for (let i = 0; i < max; i += 1) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

function main() {
  const files = getCandidateFiles();
  if (files.length === 0) {
    process.exit(0);
  }

  const blockedFiles = [];
  const contentFindings = [];

  for (const relPath of files) {
    const normalized = relPath.replaceAll(path.sep, "/");
    if (blockedFilePatterns.some((pattern) => pattern.test(normalized))) {
      blockedFiles.push(relPath);
      continue;
    }

    if (!fs.existsSync(relPath)) continue;

    const raw = fs.readFileSync(relPath);
    if (isBinary(raw)) continue;

    const content = raw.toString("utf8");
    for (const pattern of secretValuePatterns) {
      if (pattern.test(content)) {
        contentFindings.push({ file: relPath, pattern: String(pattern) });
        break;
      }
    }
  }

  if (blockedFiles.length === 0 && contentFindings.length === 0) {
    process.exit(0);
  }

  console.error("\nBlocked: potential sensitive data detected.\n");
  if (blockedFiles.length > 0) {
    console.error("Blocked files:");
    for (const file of blockedFiles) console.error(` - ${file}`);
    console.error("");
  }

  if (contentFindings.length > 0) {
    console.error("Files containing potential secrets:");
    for (const finding of contentFindings) {
      console.error(` - ${finding.file}`);
    }
    console.error("");
  }

  console.error(
    "Remove sensitive content before commit/push. Never commit .env files or private keys.\n"
  );
  process.exit(1);
}

main();
