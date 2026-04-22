import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { spawn, spawnSync } from "node:child_process";

const rootDir = process.cwd();
const apiDir = path.join(rootDir, "apps", "api");
const logDir = path.join(rootDir, ".codex-logs", "worktree");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";
const pythonCmd = process.env.PYTHON || (isWindows ? "python" : "python3");
const shellCmd = isWindows ? "cmd.exe" : "sh";

const webPort = Number(process.env.WEB_PORT || 3000);
const apiPort = Number(process.env.API_PORT || 8000);
const host = process.env.HOST || "127.0.0.1";

fs.mkdirSync(logDir, { recursive: true });

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || rootDir,
    env: { ...process.env, ...(options.env || {}) },
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runCapture(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd || rootDir,
    env: { ...process.env, ...(options.env || {}) },
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortOpen(port, targetHost = host) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.setTimeout(1500, () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, targetHost);
  });
}

async function waitForPort(port, label) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await isPortOpen(port)) {
      console.log(`${label} is ready on http://${host}:${port}`);
      return;
    }
    await wait(1500);
  }

  console.warn(`${label} did not become ready in time. Check logs under ${logDir}`);
}

function startDetached(command, args, options = {}) {
  const stdoutPath = path.join(logDir, options.stdoutFile || "service.log");
  const stderrPath = path.join(logDir, options.stderrFile || "service.err.log");
  const stdout = fs.openSync(stdoutPath, "a");
  const stderr = fs.openSync(stderrPath, "a");

  const child = spawn(command, args, {
    cwd: options.cwd || rootDir,
    env: { ...process.env, ...(options.env || {}) },
    detached: true,
    stdio: ["ignore", stdout, stderr],
    windowsHide: true,
  });

  child.unref();
}

function commandExists(command) {
  const probe = isWindows
    ? runCapture(shellCmd, ["/d", "/s", "/c", `where ${command}`])
    : runCapture(shellCmd, ["-lc", `command -v ${command}`]);
  return probe.status === 0;
}

function tryInstallGithubCli() {
  if (commandExists("gh")) {
    console.log("GitHub CLI already installed.");
    return;
  }

  console.log("GitHub CLI not found. Trying to install...");

  if (isWindows && commandExists("winget")) {
    const result = runCapture("winget", [
      "install",
      "--id",
      "GitHub.cli",
      "--exact",
      "--source",
      "winget",
      "--accept-package-agreements",
      "--accept-source-agreements",
      "--disable-interactivity",
    ]);
    if (result.status === 0 && commandExists("gh")) {
      console.log("GitHub CLI installed via winget.");
      return;
    }
  }

  console.warn("GitHub CLI install was skipped or failed. Ensure `gh` is available in PATH.");
}

function configureGithubCli() {
  tryInstallGithubCli();

  if (!commandExists("gh")) {
    return;
  }

  console.log("Configuring GitHub CLI...");
  runCapture("gh", ["config", "set", "git_protocol", "https"]);
  runCapture("gh", ["config", "set", "prompt", "disabled"]);

  if (process.env.GH_TOKEN) {
    const authCheck = runCapture("gh", ["auth", "status"]);
    if (authCheck.status !== 0) {
      const login = spawnSync("gh", ["auth", "login", "--with-token"], {
        cwd: rootDir,
        env: process.env,
        input: `${process.env.GH_TOKEN}\n`,
        encoding: "utf8",
        stdio: ["pipe", "inherit", "inherit"],
      });
      if (login.status === 0) {
        console.log("GitHub CLI authenticated using GH_TOKEN.");
      } else {
        console.warn("GitHub CLI authentication failed. Check GH_TOKEN.");
      }
    } else {
      console.log("GitHub CLI already authenticated.");
    }
    return;
  }

  console.log("GH_TOKEN not provided. GitHub CLI was configured but not authenticated.");
}

function ensureNodeDependencies() {
  const nodeModulesPath = path.join(rootDir, "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    console.log("Installing Node dependencies...");
    run(npmCmd, ["install"]);
    return;
  }

  console.log("Node dependencies already installed.");
}

function ensurePythonDependencies() {
  const pyprojectPath = path.join(apiDir, "pyproject.toml");
  if (!fs.existsSync(pyprojectPath)) {
    console.log("No API pyproject.toml found. Skipping Python dependency install.");
    return;
  }

  console.log("Installing API Python dependencies...");
  run(pythonCmd, ["-m", "pip", "install", "-e", ".[dev]"], { cwd: apiDir });
}

function buildWeb() {
  console.log("Building web app...");
  run(npmCmd, ["run", "build:web"]);
}

async function startApiIfNeeded() {
  if (await isPortOpen(apiPort)) {
    console.log(`API already running on http://${host}:${apiPort}`);
    return;
  }

  console.log("Starting API service...");
  startDetached(
    pythonCmd,
    ["-m", "uvicorn", "app.main:app", "--host", host, "--port", String(apiPort)],
    {
      cwd: apiDir,
      stdoutFile: "api.log",
      stderrFile: "api.err.log",
    },
  );
  await waitForPort(apiPort, "API");
}

async function startWebIfNeeded() {
  if (await isPortOpen(webPort)) {
    console.log(`Web already running on http://${host}:${webPort}`);
    return;
  }

  console.log("Starting web app...");
  startDetached(
    npmCmd,
    ["run", "dev", "--workspace", "@xingdianping/web", "--", "--hostname", host, "--port", String(webPort)],
    {
      stdoutFile: "web.log",
      stderrFile: "web.err.log",
      env: {
        PORT: String(webPort),
        HOSTNAME: host,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || `http://${host}:${apiPort}`,
      },
    },
  );
  await waitForPort(webPort, "Web");
}

async function main() {
  console.log(`Worktree setup started in ${rootDir}`);
  configureGithubCli();
  ensureNodeDependencies();
  ensurePythonDependencies();
  buildWeb();
  await startApiIfNeeded();
  await startWebIfNeeded();
  console.log("Worktree setup finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
