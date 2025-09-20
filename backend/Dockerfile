# --- Stage 1: deps (composer) ---
FROM composer:2.7 AS vendor
WORKDIR /app

# Copy only composer files to leverage build cache
COPY composer.json composer.lock ./

# Install PHP deps for production
RUN composer install --no-dev --prefer-dist --no-progress --no-interaction --optimize-autoloader

# --- Stage 2: runtime (php) ---
FROM php:8.3-cli-alpine AS app
WORKDIR /var/www/html

# System libs and build deps
RUN apk add --no-cache \
    bash git icu-libs libzip libpng freetype libjpeg-turbo libpq \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
       icu-dev libzip-dev postgresql-dev libpng-dev freetype-dev libjpeg-turbo-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_pgsql bcmath intl zip gd pcntl opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Copy app and composer vendor from builder
COPY . .
COPY --from=vendor /app/vendor ./vendor

# Ensure storage is writable
RUN chown -R www-data:www-data storage bootstrap/cache

# Add start script
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Expose nothing; Render sets $PORT and we bind to it in start.sh
CMD ["/usr/local/bin/start.sh"]