from __future__ import annotations

import json
import os
import re
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import ProxyHandler, Request, build_opener


ROOT = Path(__file__).resolve().parent
API_DIR = ROOT / "apps" / "api"
WEB_DIR = ROOT / "apps" / "web"
ENV_FILE = ROOT / ".env"
ENV_EXAMPLE_FILE = ROOT / ".env.example"
START_LOCK_FILE = ROOT / ".start.lock"

DEFAULT_API_PORT = 8000
DEFAULT_WEB_PORT = 3000
MYSQL_PORT = 3306
REDIS_PORT = 6379
DEFAULT_WAIT_SECONDS = 45
DEV_SERVER_PORTS = (DEFAULT_API_PORT, DEFAULT_WEB_PORT)
HTTP_OPENER = build_opener(ProxyHandler({}))


def get_api_python_executable() -> Path:
    candidates = [
        API_DIR / ".venv" / "Scripts" / "python.exe",
        API_DIR / ".venv" / "bin" / "python",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return Path(sys.executable)


def write_console_line(message: str, *, stream: object = sys.stdout) -> None:
    line = f"{message}\n"
    try:
        stream.write(line)
    except UnicodeEncodeError:
        encoding = getattr(stream, "encoding", None) or "utf-8"
        data = line.encode(encoding, errors="replace")
        buffer = getattr(stream, "buffer", None)
        if buffer is not None:
            buffer.write(data)
        else:
            stream.write(data.decode(encoding, errors="replace"))
    stream.flush()


def info(message: str) -> None:
    write_console_line(f"[start] {message}")


def warn(message: str) -> None:
    write_console_line(f"[start][warn] {message}")


def fail(message: str) -> None:
    write_console_line(f"[start][error] {message}", stream=sys.stderr)
    raise SystemExit(1)


def print_help() -> None:
    print(
        "Usage: python start.py [--stop|--restart]\n"
        "Starts only the local dev runtime required by this repo: mysql/redis (when needed), API, and Web.\n"
        "Before each start, the previous launcher instance is stopped automatically.\n"
        "  --stop     Stop the existing launcher and its child processes.\n"
        "  --restart  Stop first, then start again.\n"
        "\n"
        "This script no longer installs dependencies, rewrites .env, runs migrations, or performs extra setup.",
        flush=True,
    )


def parse_args(argv: list[str]) -> str:
    action = "start"
    for argument in argv[1:]:
        if argument in {"-h", "--help"}:
            print_help()
            raise SystemExit(0)
        if argument == "--stop":
            if action != "start":
                fail("Use only one of --stop or --restart.")
            action = "stop"
            continue
        if argument == "--restart":
            if action != "start":
                fail("Use only one of --stop or --restart.")
            action = "restart"
            continue
        fail(f"Unknown argument: {argument}")
    return action


def ensure_command(command: str, hint: str) -> None:
    if shutil.which(command):
        return
    fail(f"Missing required command `{command}`. {hint}")


def resolve_command(command: list[str]) -> list[str]:
    resolved = shutil.which(command[0])
    if not resolved:
        return command
    return [resolved, *command[1:]]


def run_step(command: list[str], *, cwd: Path, env: dict[str, str], label: str) -> None:
    info(label)
    subprocess.run(resolve_command(command), cwd=cwd, env=env, check=True)


def load_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def rewrite_docker_aliases(env: dict[str, str]) -> dict[str, str]:
    result = dict(env)
    replacements = {
        "@mysql:": "@localhost:",
        "@redis:": "@localhost:",
        "redis://redis": "redis://localhost",
    }
    for key in ("DATABASE_URL", "REDIS_URL"):
        current = result.get(key, "")
        for source, target in replacements.items():
            if source in current:
                result[key] = current.replace(source, target)
                info(f"Rewrote {key} from docker host to localhost for local startup.")
                break
    return result


def build_runtime_env(file_env: dict[str, str], *, api_python: Path) -> dict[str, str]:
    env = os.environ.copy()
    for key in ("PYTHONHOME", "PYTHONPATH", "VIRTUAL_ENV", "__PYVENV_LAUNCHER__"):
        env.pop(key, None)

    env.update(file_env)
    env["NEXT_PUBLIC_API_BASE_URL"] = f"http://localhost:{DEFAULT_API_PORT}"
    env["FRONTEND_PORT"] = str(DEFAULT_WEB_PORT)
    env.setdefault("PYTHONUTF8", "1")
    env.setdefault("PYTHONIOENCODING", "utf-8")

    api_python_dir = str(api_python.parent)
    env["PATH"] = os.pathsep.join([api_python_dir, env.get("PATH", "")])
    if api_python.parent.name.lower() in {"scripts", "bin"}:
        env["VIRTUAL_ENV"] = str(api_python.parent.parent)

    return rewrite_docker_aliases(env)


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(("127.0.0.1", port))
        except OSError:
            return True
        return False


def ensure_port_free(port: int, name: str) -> None:
    if is_port_in_use(port):
        fail(
            f"{name} port {port} is already in use. "
            f"Stop the existing process first, or run `python start.py --stop`."
        )


def wait_for_port(port: int, *, name: str, timeout_seconds: int = DEFAULT_WAIT_SECONDS) -> None:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=2):
                info(f"{name} is ready on localhost:{port}.")
                return
        except OSError:
            time.sleep(1)

    fail(f"{name} did not become reachable on localhost:{port} within {timeout_seconds}s.")


def _probe_http_once(url: str, *, timeout_seconds: int) -> tuple[int | None, str]:
    result: dict[str, object] = {}

    def worker() -> None:
        try:
            request = Request(url, headers={"User-Agent": "start.py", "Connection": "close"})
            with HTTP_OPENER.open(request, timeout=timeout_seconds) as response:
                body = response.read().decode("utf-8", errors="replace").strip()
                result["status"] = response.status
                result["message"] = body
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace").strip()
            result["status"] = exc.code
            result["message"] = f"HTTP {exc.code}: {body}" if body else f"HTTP {exc.code}"
        except Exception as exc:
            result["message"] = str(exc)

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()
    thread.join(timeout_seconds + 1)

    if thread.is_alive():
        return None, f"timed out after {timeout_seconds + 1}s"

    status = result.get("status")
    if isinstance(status, int):
        return status, str(result.get("message", "") or "")
    return None, str(result.get("message", "unknown error") or "unknown error")


def wait_for_http_ready(
    url: str,
    *,
    name: str,
    timeout_seconds: int = DEFAULT_WAIT_SECONDS,
    watched_processes: list[tuple[str, subprocess.Popen[str]]] | None = None,
) -> None:
    deadline = time.time() + timeout_seconds
    last_error = ""
    last_progress_log_at = 0.0
    while time.time() < deadline:
        if watched_processes:
            for process_name, process in watched_processes:
                exit_code = process.poll()
                if exit_code is not None:
                    fail(
                        f"{name} did not become ready because {process_name} exited with code {exit_code}. "
                        "Check the process logs printed above for the root cause."
                    )

        status, message = _probe_http_once(url, timeout_seconds=3)
        if status is not None and 200 <= status < 300:
            info(f"{name} responded successfully at {url}.")
            return

        if status is not None:
            last_error = message or f"HTTP {status}"
        else:
            last_error = message

        now = time.time()
        if now - last_progress_log_at >= 5:
            remaining = max(0, int(deadline - now))
            info(f"Waiting for {name}... {remaining}s left. Last error: {last_error or 'unknown'}")
            last_progress_log_at = now
        time.sleep(1)

    fail(f"{name} did not become reachable at {url} within {timeout_seconds}s. Last error: {last_error or 'unknown'}")


def normalize_json_result(payload: str) -> list[dict[str, object]]:
    text = payload.strip()
    if not text:
        return []
    data = json.loads(text)
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]
    if isinstance(data, dict):
        return [data]
    return []


def list_processes_on_ports(ports: tuple[int, ...]) -> list[dict[str, object]]:
    if not ports:
        return []

    if os.name == "nt":
        try:
            result = subprocess.run(
                ["netstat", "-ano", "-p", "TCP"],
                cwd=ROOT,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
                timeout=5,
            )
        except subprocess.TimeoutExpired:
            warn("Timed out while inspecting listening ports with netstat.")
            return []
        if result.returncode != 0:
            warn(f"Unable to inspect listening ports: {result.stderr.strip() or result.stdout.strip()}")
            return []

        grouped: dict[int, dict[str, object]] = {}
        port_set = {str(port) for port in ports}
        for raw_line in result.stdout.splitlines():
            line = raw_line.strip()
            if not line or "LISTENING" not in line.upper():
                continue

            parts = line.split()
            if len(parts) < 5:
                continue

            local_address = parts[1]
            state = parts[3].upper()
            pid_text = parts[4]
            if state != "LISTENING" or ":" not in local_address:
                continue

            port = local_address.rsplit(":", 1)[-1]
            if port not in port_set:
                continue

            try:
                pid = int(pid_text)
            except ValueError:
                continue

            entry = grouped.setdefault(
                pid,
                {
                    "pid": pid,
                    "name": "",
                    "command_line": "",
                    "ports": [],
                },
            )
            current_ports = list(entry.get("ports", []))
            port_number = int(port)
            if port_number not in current_ports:
                current_ports.append(port_number)
                current_ports.sort()
                entry["ports"] = current_ports

        for pid, entry in grouped.items():
            command_line = read_windows_process_command_line(pid)
            entry["command_line"] = command_line
            entry["name"] = Path(command_line.split()[0]).name if command_line else ""

        return list(grouped.values())

    result = subprocess.run(
        ["lsof", "-nP", "-iTCP", "-sTCP:LISTEN"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if result.returncode != 0:
        return []

    matches: list[dict[str, object]] = []
    port_set = {str(port) for port in ports}
    for line in result.stdout.splitlines()[1:]:
        parts = line.split()
        if len(parts) < 9:
            continue
        try:
            pid = int(parts[1])
        except ValueError:
            continue
        endpoint = parts[8]
        port = endpoint.rsplit(":", 1)[-1]
        if port not in port_set:
            continue
        matches.append(
            {
                "pid": pid,
                "name": parts[0],
                "command_line": " ".join(parts),
                "ports": [int(port)],
            }
        )
    return matches


def read_lock_file(path: Path) -> dict[str, object] | None:
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return data if isinstance(data, dict) else None


def read_windows_process_command_line(pid: int) -> str:
    if pid <= 0 or os.name != "nt":
        return ""

    script = rf"""
$proc = Get-CimInstance Win32_Process -Filter "ProcessId = {pid}" -ErrorAction SilentlyContinue
if ($proc) {{
  $proc.CommandLine
}}
"""
    try:
        result = subprocess.run(
            ["powershell", "-NoProfile", "-Command", script],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
            timeout=3,
        )
    except subprocess.TimeoutExpired:
        return ""

    if result.returncode != 0:
        return ""
    return result.stdout.strip()


def write_lock_file(path: Path) -> None:
    payload = {
        "pid": os.getpid(),
        "created_at": time.time(),
        "api_port": DEFAULT_API_PORT,
        "web_port": DEFAULT_WEB_PORT,
        "api_pid": None,
        "web_pid": None,
    }
    path.write_text(json.dumps(payload, ensure_ascii=True), encoding="utf-8")


def update_lock_file(path: Path, **updates: object) -> None:
    payload = read_lock_file(path) or {}
    payload.update(updates)
    payload.setdefault("pid", os.getpid())
    payload.setdefault("created_at", time.time())
    payload.setdefault("api_port", DEFAULT_API_PORT)
    payload.setdefault("web_port", DEFAULT_WEB_PORT)
    path.write_text(json.dumps(payload, ensure_ascii=True), encoding="utf-8")


def release_start_lock(path: Path) -> None:
    lock_data = read_lock_file(path)
    if not lock_data:
        return
    if int(lock_data.get("pid", 0) or 0) != os.getpid():
        return
    try:
        path.unlink()
    except OSError:
        pass


def process_is_running(pid: int) -> bool:
    if pid <= 0:
        return False

    try:
        if os.name == "nt":
            result = subprocess.run(
                ["tasklist", "/FI", f"PID eq {pid}", "/FO", "CSV", "/NH"],
                cwd=ROOT,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
            )
            return result.returncode == 0 and f'"{pid}"' in result.stdout
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def list_other_start_script_processes() -> list[dict[str, object]]:
    if os.name == "nt":
        script = r"""
$proc = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object {
    ($_.Name -in @('python.exe', 'pythonw.exe', 'py.exe')) -and
    ($_.CommandLine -like '*start.py*')
  } |
  ForEach-Object {
    [PSCustomObject]@{
      pid = $_.ProcessId
      name = $_.Name
      command_line = $_.CommandLine
    }
  }
$proc | ConvertTo-Json -Compress
"""
        result = subprocess.run(
            ["powershell", "-NoProfile", "-Command", script],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )
        if result.returncode != 0:
            return []
        return [
            item
            for item in normalize_json_result(result.stdout)
            if int(item.get("pid", 0) or 0) not in {0, os.getpid()}
        ]

    result = subprocess.run(
        ["ps", "-eo", "pid=,command="],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if result.returncode != 0:
        return []

    matches: list[dict[str, object]] = []
    for line in result.stdout.splitlines():
        stripped = line.strip()
        if "start.py" not in stripped:
            continue
        pid_text, _, command_line = stripped.partition(" ")
        try:
            pid = int(pid_text)
        except ValueError:
            continue
        if pid != os.getpid():
            matches.append({"pid": pid, "command_line": command_line.strip()})
    return matches


def is_workspace_dev_process(process: dict[str, object]) -> bool:
    pid = int(process.get("pid", 0) or 0)
    if pid <= 0 or pid == os.getpid():
        return False

    command_line = str(process.get("command_line", "") or "").lower()
    if not command_line:
        return False

    workspace_root = str(ROOT).lower()
    api_signature = "app.main:app"
    web_signatures = ("next dev", "next/dist/bin/next", "scripts/dev.mjs")

    if workspace_root in command_line and api_signature in command_line:
        return True
    if workspace_root in command_line and any(signature in command_line for signature in web_signatures):
        return True

    return False


def acquire_start_lock(path: Path) -> None:
    lock_data = read_lock_file(path)
    if lock_data:
        pid = int(lock_data.get("pid", 0) or 0)
        if pid and process_is_running(pid):
            fail(
                f"start.py is already running (pid={pid}). "
                f"Web should be on http://localhost:{DEFAULT_WEB_PORT}, API on http://localhost:{DEFAULT_API_PORT}."
            )

    live_matches = list_other_start_script_processes()
    if live_matches:
        pid = int(live_matches[0].get("pid", 0) or 0)
        fail(f"Another start.py process is already running (pid={pid}). Stop it first.")

    write_lock_file(path)


def stop_process_by_pid(pid: int, *, name: str) -> bool:
    if pid <= 0 or pid == os.getpid() or not process_is_running(pid):
        return False

    info(f"Stopping {name} (pid={pid})")
    try:
        if os.name == "nt":
            subprocess.run(
                ["taskkill", "/PID", str(pid), "/T", "/F"],
                cwd=ROOT,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
            )
        else:
            os.kill(pid, signal.SIGTERM)
    except OSError:
        return False
    return True


def stop_windows_process_tree(pid: int, *, name: str) -> bool:
    if pid <= 0 or pid == os.getpid() or not process_is_running(pid):
        return False

    info(f"Stopping {name}...")
    result = subprocess.run(
        ["taskkill", "/PID", str(pid), "/T", "/F"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    return result.returncode == 0 or not process_is_running(pid)


def stop_existing_launcher(*, verbose: bool = True) -> bool:
    stopped_any = False

    lock_data = read_lock_file(START_LOCK_FILE)
    if lock_data:
        for key, name in (("api_pid", "existing API"), ("web_pid", "existing Web"), ("pid", "existing launcher")):
            pid = int(lock_data.get(key, 0) or 0)
            stopped_any = stop_process_by_pid(pid, name=name) or stopped_any

    for process in list_other_start_script_processes():
        pid = int(process.get("pid", 0) or 0)
        stopped_any = stop_process_by_pid(pid, name="existing launcher") or stopped_any

    for process in list_processes_on_ports(DEV_SERVER_PORTS):
        if not is_workspace_dev_process(process):
            continue
        pid = int(process.get("pid", 0) or 0)
        ports = ",".join(str(port) for port in process.get("ports", []))
        name = str(process.get("name", "dev process"))
        stopped_any = stop_process_by_pid(pid, name=f"{name} on ports {ports}") or stopped_any

    if START_LOCK_FILE.exists():
        try:
            START_LOCK_FILE.unlink()
        except OSError:
            pass

    if verbose:
        if stopped_any:
            info("Existing launcher or dev services have been stopped.")
        else:
            info("No existing launcher or dev services were found.")
    return stopped_any


def uses_local_mysql(env: dict[str, str]) -> bool:
    database_url = env.get("DATABASE_URL", "").lower()
    if not database_url.startswith("mysql"):
        return False
    return any(host in database_url for host in ("@localhost:", "@127.0.0.1:", "@mysql:"))


def uses_local_redis(env: dict[str, str]) -> bool:
    redis_url = env.get("REDIS_URL", "").lower()
    return redis_url.startswith("redis://localhost") or redis_url.startswith("redis://127.0.0.1") or redis_url.startswith(
        "redis://redis"
    )


def get_local_mysql_port(env: dict[str, str]) -> int:
    database_url = env.get("DATABASE_URL", "")
    match = re.search(r"@(?:localhost|127\.0\.0\.1|mysql):(\d+)", database_url, flags=re.IGNORECASE)
    if not match:
        return MYSQL_PORT
    return int(match.group(1))


def describe_mysql_target(env: dict[str, str]) -> str:
    database_url = env.get("DATABASE_URL", "")
    if not database_url:
        return "DATABASE_URL is empty"
    match = re.search(r"@([^/:?#]+)(?::(\d+))?", database_url)
    if not match:
        return database_url
    host = match.group(1)
    port = match.group(2) or str(MYSQL_PORT)
    return f"{host}:{port}"


def ensure_required_services(env: dict[str, str]) -> None:
    mysql_required = uses_local_mysql(env)
    redis_required = uses_local_redis(env)
    mysql_port = get_local_mysql_port(env)
    mysql_ready = (not mysql_required) or is_port_in_use(mysql_port)
    redis_ready = (not redis_required) or is_port_in_use(REDIS_PORT)

    if mysql_ready and redis_ready:
        info("Configured local services are reachable.")
        return

    if mysql_required and not mysql_ready:
        fail(
            "Local MySQL is required before startup, but it is not reachable at "
            f"{describe_mysql_target(env)}. Start MySQL first, then rerun `python start.py`."
        )

    if redis_required and not redis_ready:
        warn(
            "Local Redis is not reachable on localhost:6379. Continuing in degraded mode because Redis is optional."
        )


def stream_output(process: subprocess.Popen[str], prefix: str) -> None:
    if process.stdout is None:
        return
    for line in process.stdout:
        write_console_line(f"[{prefix}] {line.rstrip()}")


def spawn_process(
    command: list[str],
    *,
    cwd: Path,
    env: dict[str, str],
    name: str,
) -> tuple[subprocess.Popen[str], threading.Thread]:
    creationflags = 0
    if os.name == "nt":
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP

    process = subprocess.Popen(
        resolve_command(command),
        cwd=cwd,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
        creationflags=creationflags,
    )
    thread = threading.Thread(target=stream_output, args=(process, name), daemon=True)
    thread.start()
    return process, thread


def terminate_process(process: subprocess.Popen[str], name: str) -> None:
    if process.poll() is not None:
        return

    if os.name == "nt":
        if stop_windows_process_tree(process.pid, name=name):
            return
        warn(f"{name} did not exit cleanly via taskkill; falling back to process termination.")
        process.kill()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            warn(f"{name} did not exit after forced kill.")
        return
    else:
        info(f"Stopping {name}...")
        process.terminate()

    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        warn(f"{name} did not exit in time; killing it.")
        process.kill()
        process.wait(timeout=5)


def wait_for_processes(processes: list[tuple[str, subprocess.Popen[str]]]) -> int:
    try:
        while True:
            for name, process in processes:
                exit_code = process.poll()
                if exit_code is not None:
                    warn(f"{name} exited with code {exit_code}.")
                    return exit_code
            time.sleep(1)
    except KeyboardInterrupt:
        info("Ctrl+C received, shutting down child processes.")
        return 0


def main() -> None:
    action = parse_args(sys.argv)

    if action == "stop":
        stop_existing_launcher(verbose=True)
        return

    if stop_existing_launcher(verbose=(action == "restart")):
        time.sleep(1)

    ensure_command("npm", "Install Node.js first.")
    ensure_command("node", "Install Node.js first.")

    api_python = get_api_python_executable()
    if not api_python.exists():
        fail(f"Python executable was not found: {api_python}")
    if not WEB_DIR.exists():
        fail(f"Frontend directory does not exist: {WEB_DIR}")
    if not API_DIR.exists():
        fail(f"API directory does not exist: {API_DIR}")
    if not ENV_FILE.exists():
        fail(f"Missing {ENV_FILE.name}. Create it first, for example by copying {ENV_EXAMPLE_FILE.name}.")

    acquire_start_lock(START_LOCK_FILE)

    api_process: subprocess.Popen[str] | None = None
    web_process: subprocess.Popen[str] | None = None
    api_thread: threading.Thread | None = None
    web_thread: threading.Thread | None = None

    try:
        info("Starting minimal local dev stack...")
        runtime_env = build_runtime_env(load_env_file(ENV_FILE), api_python=api_python)

        ensure_port_free(DEFAULT_API_PORT, "API")
        ensure_port_free(DEFAULT_WEB_PORT, "Web")
        ensure_required_services(runtime_env)

        api_process, api_thread = spawn_process(
            [
                str(api_python),
                "-m",
                "uvicorn",
                "app.main:app",
                "--reload",
                "--host",
                "0.0.0.0",
                "--port",
                str(DEFAULT_API_PORT),
            ],
            cwd=API_DIR,
            env=runtime_env,
            name="api",
        )
        update_lock_file(
            START_LOCK_FILE,
            api_pid=api_process.pid,
            web_pid=None,
        )

        wait_for_http_ready(
            f"http://localhost:{DEFAULT_API_PORT}/health/ready",
            name="API readiness",
            watched_processes=[("API", api_process)],
        )

        web_process, web_thread = spawn_process(
            ["node", str(WEB_DIR / "scripts" / "dev.mjs"), "--hostname", "0.0.0.0", "--port", str(DEFAULT_WEB_PORT)],
            cwd=WEB_DIR,
            env=runtime_env,
            name="web",
        )
        update_lock_file(
            START_LOCK_FILE,
            api_pid=api_process.pid,
            web_pid=web_process.pid,
        )
        wait_for_http_ready(
            f"http://localhost:{DEFAULT_WEB_PORT}",
            name="Web",
            watched_processes=[("API", api_process), ("Web", web_process)],
        )

        info(f"API: http://localhost:{DEFAULT_API_PORT}")
        info(f"Web: http://localhost:{DEFAULT_WEB_PORT}")
        info("Web/API/DB readiness passed. Press Ctrl+C to stop API and Web.")

        exit_code = wait_for_processes([("api", api_process), ("web", web_process)])
        if exit_code not in (0, None):
            raise SystemExit(exit_code)
    finally:
        if web_process is not None:
            terminate_process(web_process, "Web")
        if api_process is not None:
            terminate_process(api_process, "API")
        if api_thread is not None:
            api_thread.join(timeout=2)
        if web_thread is not None:
            web_thread.join(timeout=2)
        release_start_lock(START_LOCK_FILE)


if __name__ == "__main__":
    main()
