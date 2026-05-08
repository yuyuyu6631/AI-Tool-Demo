#!/usr/bin/env python3
"""Deploy the current repository snapshot to the production Podman host."""

from __future__ import annotations

import argparse
import getpass
import os
import posixpath
import shlex
import subprocess
import sys
import tempfile
import textwrap
import time
from pathlib import Path

try:
    import paramiko
except ImportError:  # pragma: no cover - runtime environment dependent
    print("Missing dependency: paramiko. Install it in the local Python environment first.", file=sys.stderr)
    raise


REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_HOST = os.environ.get("DEPLOY_HOST", "192.168.8.200")
DEFAULT_USER = os.environ.get("DEPLOY_USER", "agent")
DEFAULT_DIR = os.environ.get("DEPLOY_DIR", "/home/agent/xingdianping")
DEFAULT_PUBLIC_URL = os.environ.get("DEPLOY_PUBLIC_URL", "http://changsha.01view.ydns.eu:12318/xingdp/")


def run_local(command: list[str]) -> str:
    completed = subprocess.run(
        command,
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return completed.stdout.strip()


def ensure_clean_main() -> str:
    branch = run_local(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    if branch != "main":
        raise RuntimeError(f"Deployment must run from main. Current branch: {branch}")

    status = run_local(["git", "status", "--short"])
    if status:
        raise RuntimeError("Working tree is not clean. Commit or stash changes before deploying.")

    return run_local(["git", "rev-parse", "--short=12", "HEAD"])


def create_archive(commit: str) -> Path:
    temp_dir = Path(tempfile.mkdtemp(prefix="xdp-deploy-"))
    archive_path = temp_dir / f"xdp-{commit}.tar"
    subprocess.run(
        ["git", "archive", "--format=tar", f"--output={archive_path}", "HEAD"],
        cwd=REPO_ROOT,
        check=True,
    )
    return archive_path


def remote_quote(value: str) -> str:
    return shlex.quote(value)


def remote_exec(client: paramiko.SSHClient, command: str, *, timeout: int = 60, stream: bool = False) -> int:
    channel = client.get_transport().open_session()
    channel.get_pty()
    channel.exec_command(command)
    started = time.time()

    def write_output(data: bytes) -> None:
        if hasattr(sys.stdout, "buffer"):
            sys.stdout.buffer.write(data)
        else:
            sys.stdout.write(data.decode("utf-8", errors="replace"))
        sys.stdout.flush()

    while True:
        if channel.recv_ready():
            write_output(channel.recv(4096))
        if channel.recv_stderr_ready():
            write_output(channel.recv_stderr(4096))
        if channel.exit_status_ready():
            while channel.recv_ready():
                write_output(channel.recv(4096))
            while channel.recv_stderr_ready():
                write_output(channel.recv_stderr(4096))
            return channel.recv_exit_status()
        if not stream and time.time() - started > timeout:
            channel.close()
            raise TimeoutError(f"Remote command timed out after {timeout}s")
        time.sleep(0.2)


def upload_archive(client: paramiko.SSHClient, local_archive: Path, remote_archive: str) -> None:
    sftp = client.open_sftp()
    try:
        sftp.put(str(local_archive), remote_archive)
    finally:
        sftp.close()


def build_release_command(commit: str, deploy_dir: str, remote_archive: str, keep_backups: int) -> str:
    release_dir = f"{deploy_dir}.release.{commit}"
    deploy_parent = posixpath.dirname(deploy_dir.rstrip("/"))
    deploy_name = posixpath.basename(deploy_dir.rstrip("/"))
    keep_backups = max(1, keep_backups)

    return textwrap.dedent(
        f"""
        set -euo pipefail
        RELEASE_DIR={remote_quote(release_dir)}
        DEPLOY_DIR={remote_quote(deploy_dir)}
        DEPLOY_PARENT={remote_quote(deploy_parent)}
        DEPLOY_NAME={remote_quote(deploy_name)}
        REMOTE_ARCHIVE={remote_quote(remote_archive)}
        BACKUP_DIR="$DEPLOY_PARENT/$DEPLOY_NAME.backup.$(date +%Y%m%d%H%M%S)"

        rm -rf "$RELEASE_DIR"
        mkdir -p "$RELEASE_DIR"
        tar -xf "$REMOTE_ARCHIVE" -C "$RELEASE_DIR"
        if [ -f "$DEPLOY_DIR/.env.runtime" ]; then
          cp "$DEPLOY_DIR/.env.runtime" "$RELEASE_DIR/.env.runtime"
        fi
        chmod +x "$RELEASE_DIR/deploy_podman_prod.sh" "$RELEASE_DIR/start_podman_prod.sh"
        if [ -d "$DEPLOY_DIR" ]; then
          mv "$DEPLOY_DIR" "$BACKUP_DIR"
        fi
        mv "$RELEASE_DIR" "$DEPLOY_DIR"
        rm -f "$REMOTE_ARCHIVE"
        ls -dt "$DEPLOY_PARENT/$DEPLOY_NAME.backup."* 2>/dev/null | tail -n +{keep_backups + 1} | xargs -r rm -rf
        echo "release={commit}"
        echo "backup=$BACKUP_DIR"
        """
    ).strip()


def build_deploy_command(deploy_dir: str) -> str:
    return textwrap.dedent(
        f"""
        set -euo pipefail
        cd {remote_quote(deploy_dir)}
        podman container prune -f >/dev/null 2>&1 || true
        podman builder prune -af >/dev/null 2>&1 || true
        podman image prune -af >/dev/null 2>&1 || true
        ./deploy_podman_prod.sh
        """
    ).strip()


def build_verify_command(public_url: str) -> str:
    public_url = public_url.rstrip("/")
    return textwrap.dedent(
        f"""
        set -euo pipefail
        curl -fsSI http://127.0.0.1:3000/xingdp >/dev/null
        curl -fsS http://127.0.0.1:3000/xingdp/api/health
        echo
        curl -fsS http://127.0.0.1:8000/health/ready
        echo
        podman ps --format '{{{{.Names}}}} {{{{.Status}}}}'
        echo
        echo "public={public_url}/"
        """
    ).strip()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Deploy the current main branch snapshot to production.")
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--user", default=DEFAULT_USER)
    parser.add_argument("--deploy-dir", default=DEFAULT_DIR)
    parser.add_argument("--public-url", default=DEFAULT_PUBLIC_URL)
    parser.add_argument("--password", default=os.environ.get("DEPLOY_PASSWORD"))
    parser.add_argument("--keep-backups", type=int, default=2)
    parser.add_argument("--skip-verify", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    commit = ensure_clean_main()
    archive = create_archive(commit)
    password = args.password or getpass.getpass(f"Password for {args.user}@{args.host}: ")
    remote_archive = posixpath.join(posixpath.dirname(args.deploy_dir.rstrip("/")), f"xdp-main-{commit}.tar")

    print(f"Deploying commit {commit} to {args.user}@{args.host}:{args.deploy_dir}")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            hostname=args.host,
            username=args.user,
            password=password,
            timeout=15,
            banner_timeout=15,
            auth_timeout=15,
        )

        print("Uploading release archive...")
        upload_archive(client, archive, remote_archive)

        print("Switching remote release directory...")
        status = remote_exec(
            client,
            build_release_command(commit, args.deploy_dir, remote_archive, args.keep_backups),
            timeout=180,
        )
        if status != 0:
            return status

        print("Running remote Podman deploy...")
        status = remote_exec(client, build_deploy_command(args.deploy_dir), timeout=1800, stream=True)
        if status != 0:
            return status

        if not args.skip_verify:
            print("Running remote verification...")
            status = remote_exec(client, build_verify_command(args.public_url), timeout=180, stream=True)
            if status != 0:
                return status

        print("Deployment completed successfully.")
        return 0
    finally:
        client.close()
        try:
            archive.unlink()
            archive.parent.rmdir()
        except OSError:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
