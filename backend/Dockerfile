# --- Stage 1: Composer with PHP extensions ---
FROM php:8.3-cli-alpine AS vendor
WORKDIR /app

# Install system dependencies and PHP extensions for Composer
RUN apk add --no-cache git unzip libzip-dev libpng-dev freetype-dev libjpeg-turbo-dev icu-dev postgresql-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install zip gd intl pdo_pgsql bcmath

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Copy composer files and install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-progress --no-interaction --optimize-autoloader

# --- Stage 2: Runtime ---
FROM php:8.3-cli-alpine AS app
WORKDIR /var/www/html

# Runtime dependencies only
RUN apk add --no-cache bash icu-libs libzip libpng freetype libjpeg-turbo libpq \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev postgresql-dev libpng-dev freetype-dev libjpeg-turbo-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_pgsql bcmath intl zip gd pcntl opcache \
    && apk del .build-deps

# Copy application and vendor from previous stage
COPY . .
COPY --from=vendor /app/vendor ./vendor

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# Copy and set up start script
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]