# syntax=docker/dockerfile:1.6

# --- Stage 1: Composer dependencies layer ---
FROM composer:2 AS vendor

WORKDIR /app

# Copy only composer manifests first for better caching
COPY composer.json composer.lock ./

# Install PHP dependencies without running scripts (no artisan available in this stage)
RUN composer install --no-dev --no-scripts --prefer-dist --no-progress --no-interaction

# --- Stage 2: PHP runtime ---
FROM php:8.2-fpm-alpine AS runtime

ENV APP_ENV=production \
    APP_DEBUG=false \
    COMPOSER_ALLOW_SUPERUSER=1 \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0 \
    PHP_OPCACHE_ENABLE=1 \
    PHP_OPCACHE_ENABLE_CLI=1

WORKDIR /var/www/html

# System dependencies and PHP extensions
RUN apk add --no-cache \
        bash curl git unzip libzip-dev icu-data-full icu-dev oniguruma-dev postgresql-dev libpng-dev libjpeg-turbo-dev libwebp-dev freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) bcmath mbstring zip intl gd pdo pdo_pgsql opcache \
    && apk del --no-cache icu-dev oniguruma-dev libzip-dev libpng-dev libjpeg-turbo-dev libwebp-dev freetype-dev

# Copy application code
COPY . /var/www/html

# Copy vendor from build stage
COPY --from=vendor /app/vendor /var/www/html/vendor

# Copy start script
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Ensure correct permissions for storage and cache
RUN mkdir -p storage/framework/{cache,sessions,views} \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && find storage -type d -exec chmod 775 {} \; \
    && find bootstrap/cache -type d -exec chmod 775 {} \;

# Expose port for Render (Render sets $PORT env var; we’ll use PHP's built-in server)
EXPOSE 8080

# Healthcheck (optional; simple HTTP check)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD curl -fsS http://127.0.0.1:${PORT:-8080}/ || exit 1

# Default command: run start script (Render uses this to start the service)
CMD ["/usr/local/bin/start.sh"]
