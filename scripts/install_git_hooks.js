const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const hookPath = path.join(repoRoot, ".githooks");

function runGit(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  }).trim();
}

function main() {
  if (process.env.SKIP_GIT_HOOKS === "1") {
    console.log("Skipping git hook installation because SKIP_GIT_HOOKS=1.");
    return;
  }

  if (!fs.existsSync(path.join(repoRoot, ".git")) || !fs.existsSync(hookPath)) {
    return;
  }

  try {
    const insideRepo = runGit(["rev-parse", "--is-inside-work-tree"]);
    if (insideRepo !== "true") {
      return;
    }

    const currentHooksPath = runGit(["config", "--get", "core.hooksPath"]);
    if (currentHooksPath === ".githooks") {
      console.log("Git hooks already configured.");
      return;
    }
  } catch {
    // Continue to configure hooks when the value is missing or git returns non-zero.
  }

  try {
    runGit(["config", "core.hooksPath", ".githooks"]);
    console.log("Configured git hooks path to .githooks.");
  } catch (error) {
    console.warn(`Failed to configure git hooks: ${error.message}`);
  }
}

main();
