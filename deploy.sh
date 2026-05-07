#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/home/agent/xingdianping}"
BRANCH="${BRANCH:-main}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-http://changsha.01view.ydns.eu:12318}"

cd "$DEPLOY_DIR"

if [ -d .git ]; then
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
fi

if [ ! -f "$ENV_FILE" ]; then
  umask 077
  cat > "$ENV_FILE" <<EOF
MYSQL_ROOT_PASSWORD=change-me-root
MYSQL_DATABASE=xingdianping
MYSQL_USER=xingdianping
MYSQL_PASSWORD=change-me-db
AUTH_SECRET_KEY=change-me-auth-secret

NEXT_PUBLIC_BASE_PATH=/xingdp
NEXT_PUBLIC_PUBLIC_BASE_PATH=/xingdp
NEXT_PUBLIC_API_BASE_PATH=/xingdp
SERVER_API_BASE_URL=http://api:8000
CORS_ALLOWED_ORIGINS=${PUBLIC_BASE_URL}

AI_PROVIDER=openai
AI_MODEL=
AI_API_KEY=
AI_OPENAI_BASE_URL=http://host.docker.internal:9997/v1
EOF
  echo "Created $DEPLOY_DIR/$ENV_FILE. Edit secrets before re-running deploy.sh." >&2
  exit 1
fi

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

env_value() {
  local key="$1"
  grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d= -f2-
}

if [ "${DEPLOY_PULL_IMAGES:-false}" = "true" ]; then
  compose pull
fi

compose up -d --build --remove-orphans

MYSQL_ROOT_PASSWORD_VALUE="$(env_value MYSQL_ROOT_PASSWORD)"
for attempt in $(seq 1 60); do
  if compose exec -T mysql mysqladmin ping -h 127.0.0.1 -u root "-p${MYSQL_ROOT_PASSWORD_VALUE}" --silent >/dev/null 2>&1; then
    break
  fi
  if [ "$attempt" = "60" ]; then
    echo "MySQL did not become ready in time." >&2
    exit 1
  fi
  sleep 2
done

compose exec -T api python -m alembic upgrade head

for attempt in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${API_PORT:-8000}/api/health" >/dev/null; then
    break
  fi
  if [ "$attempt" = "60" ]; then
    echo "API health check did not pass in time." >&2
    exit 1
  fi
  sleep 2
done

for attempt in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${WEB_PORT:-3000}/xingdp/" >/dev/null \
    && curl -fsS "http://127.0.0.1:${WEB_PORT:-3000}/xingdp/auth" >/dev/null; then
    break
  fi
  if [ "$attempt" = "60" ]; then
    echo "Web health checks did not pass in time." >&2
    exit 1
  fi
  sleep 2
done

echo "Deploy complete."
