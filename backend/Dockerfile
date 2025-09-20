# --- Stage 1: dependencies (Composer) ---
FROM composer:2.7 AS vendor
WORKDIR /app

# Use Composer cache effectively
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-progress --no-interaction --optimize-autoloader

# --- Stage 2: runtime (PHP 8.3 on Alpine) ---
FROM php:8.3-cli-alpine AS app
WORKDIR /var/www/html

# Runtime libs only (no git here)
RUN apk add --no-cache \
    bash icu-libs libzip libpng freetype libjpeg-turbo libpq

# Build deps to compile PHP extensions, then remove them
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
      icu-dev libzip-dev postgresql-dev libpng-dev freetype-dev libjpeg-turbo-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j$(nproc) pdo_pgsql bcmath intl zip gd pcntl opcache \
  && pecl install redis \
  && docker-php-ext-enable redis \
  && apk del .build-deps

# Copy app and vendors
COPY . .
COPY --from=vendor /app/vendor ./vendor

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# Start script
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]