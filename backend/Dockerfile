FROM php:8.3-fpm-alpine

# Set working directory
WORKDIR /var/www/html

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    bash \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libzip-dev \
    icu-dev \
    && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl \
    opcache \
    && apk del .build-deps

# Configure PHP for production
RUN echo "opcache.enable=1" >> /usr/local/etc/php/php.ini \
    && echo "opcache.memory_consumption=128" >> /usr/local/etc/php/php.ini \
    && echo "opcache.max_accelerated_files=4000" >> /usr/local/etc/php/php.ini \
    && echo "opcache.revalidate_freq=60" >> /usr/local/etc/php/php.ini

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy application files
COPY . .

# Set permissions
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 755 storage bootstrap/cache

# Generate optimized autoloader
RUN composer dump-autoload --optimize --no-scripts
# Expose port (Render will set PORT environment variable)
EXPOSE $PORT

# Start script
CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=$PORT
