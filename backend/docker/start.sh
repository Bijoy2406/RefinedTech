#!/usr/bin/env sh
set -e

# Render provides $PORT; default to 8080 for local runs
PORT="${PORT:-8080}"

php -v

# Ensure APP_KEY is provided via environment (recommended for Docker on Render)
if [ -z "${APP_KEY:-}" ]; then
  echo "[warn] APP_KEY is not set. Set APP_KEY in Render env vars (e.g., base64:XXXX)."
fi

# Link storage (ignore if already linked)
php artisan storage:link || true

# Cache config & routes (safe in prod)
php artisan config:cache || true
php artisan route:cache || true

# Run migrations (idempotent in prod with --force)
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running migrations..."
  php artisan migrate --force --seed || true
fi

# Start PHP built-in server
# variables_order ensures $_ENV is populated in Laravel under PHP -S
exec php -d variables_order=EGPCS -S 0.0.0.0:"${PORT}" public/index.php
