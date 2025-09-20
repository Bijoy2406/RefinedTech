#!/usr/bin/env sh
set -e

if [ -z "$APP_KEY" ]; then
  echo "ERROR: APP_KEY is not set."
  exit 1
fi

php artisan storage:link || true
php artisan config:cache
php artisan route:cache
php artisan migrate --force --seed || true

exec php -d variables_order=EGPCS -S 0.0.0.0:${PORT:-8080} public/index.php