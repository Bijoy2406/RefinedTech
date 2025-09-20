#!/usr/bin/env sh
set -e

# Fail fast if APP_KEY is missing (avoid rotating keys on each boot)
if [ -z "$APP_KEY" ]; then
  echo "ERROR: APP_KEY is not set. Set it in Render -> Environment."
  exit 1
fi

php artisan storage:link || true
php artisan config:cache
php artisan route:cache

# Run migrations (idempotent)
php artisan migrate --force --seed || true

# Start the app (Render provides $PORT)
exec php -d variables_order=EGPCS -S 0.0.0.0:${PORT:-8080} public/index.php