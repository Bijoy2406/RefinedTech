FROM php:8.3-cli-alpine AS app
WORKDIR /var/www/html

# Install system dependencies and PHP extensions
RUN apk add --no-cache bash icu-libs libzip libpng freetype libjpeg-turbo libpq \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev postgresql-dev libpng-dev freetype-dev libjpeg-turbo-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_pgsql bcmath intl zip gd pcntl opcache \
    && apk del .build-deps

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

# Create bootstrap/cache directory and set permissions BEFORE running composer
RUN mkdir -p bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Install PHP dependencies with --no-scripts to avoid permission issues
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --prefer-dist --no-progress --no-interaction --optimize-autoloader --no-scripts

# Run Laravel setup commands manually after permissions are set
RUN php artisan package:discover --ansi

# Copy and set up start script
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]