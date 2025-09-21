FROM php:8.3-fpm-alpine AS app

# Set working directory
WORKDIR /var/www/html

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    bash \
    git \
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
    nginx \
    supervisor \
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
    && echo "opcache.enable_cli=1" >> /usr/local/etc/php/php.ini \
    && echo "opcache.memory_consumption=128" >> /usr/local/etc/php/php.ini \
    && echo "opcache.interned_strings_buffer=8" >> /usr/local/etc/php/php.ini \
    && echo "opcache.max_accelerated_files=4000" >> /usr/local/etc/php/php.ini \
    && echo "opcache.revalidate_freq=60" >> /usr/local/etc/php/php.ini \
    && echo "opcache.fast_shutdown=1" >> /usr/local/etc/php/php.ini

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Create user for Laravel
RUN addgroup -g 1000 www && \
    adduser -u 1000 -G www -s /bin/sh -D www

# Copy composer files first for better caching
COPY --chown=www:www composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy application files
COPY --chown=www:www . /var/www/html

# Create required directories and set permissions
RUN mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/storage/framework/cache \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R www:www /var/www/html/storage \
    && chown -R www:www /var/www/html/bootstrap/cache \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Run composer scripts
RUN composer dump-autoload --optimize

# Create nginx configuration
RUN echo 'server {' > /etc/nginx/nginx.conf \
    && echo '    listen 8000;' >> /etc/nginx/nginx.conf \
    && echo '    server_name _;' >> /etc/nginx/nginx.conf \
    && echo '    root /var/www/html/public;' >> /etc/nginx/nginx.conf \
    && echo '    index index.php index.html;' >> /etc/nginx/nginx.conf \
    && echo '    location / {' >> /etc/nginx/nginx.conf \
    && echo '        try_files $uri $uri/ /index.php?$query_string;' >> /etc/nginx/nginx.conf \
    && echo '    }' >> /etc/nginx/nginx.conf \
    && echo '    location ~ \.php$ {' >> /etc/nginx/nginx.conf \
    && echo '        fastcgi_pass 127.0.0.1:9000;' >> /etc/nginx/nginx.conf \
    && echo '        fastcgi_index index.php;' >> /etc/nginx/nginx.conf \
    && echo '        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;' >> /etc/nginx/nginx.conf \
    && echo '        include fastcgi_params;' >> /etc/nginx/nginx.conf \
    && echo '    }' >> /etc/nginx/nginx.conf \
    && echo '}' >> /etc/nginx/nginx.conf \
    && echo 'events {}' >> /etc/nginx/nginx.conf

# Create supervisor configuration
RUN mkdir -p /etc/supervisor/conf.d \
    && echo '[supervisord]' > /etc/supervisor/conf.d/supervisord.conf \
    && echo 'nodaemon=true' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'user=root' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo '' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo '[program:php-fpm]' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'command=php-fpm' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'stderr_logfile=/var/log/php-fpm.err.log' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'stdout_logfile=/var/log/php-fpm.out.log' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo '' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo '[program:nginx]' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'command=nginx -g "daemon off;"' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'stderr_logfile=/var/log/nginx.err.log' >> /etc/supervisor/conf.d/supervisord.conf \
    && echo 'stdout_logfile=/var/log/nginx.out.log' >> /etc/supervisor/conf.d/supervisord.conf

# Create production start script
RUN echo '#!/bin/bash' > /usr/local/bin/start.sh && \
    echo 'set -e' >> /usr/local/bin/start.sh && \
    echo 'echo "Starting RefinedTech Laravel Application (Production)..."' >> /usr/local/bin/start.sh && \
    echo '' >> /usr/local/bin/start.sh && \
    echo '# Wait for database connection' >> /usr/local/bin/start.sh && \
    echo 'echo "Waiting for database connection..."' >> /usr/local/bin/start.sh && \
    echo 'until php artisan migrate:status &>/dev/null; do' >> /usr/local/bin/start.sh && \
    echo '  echo "Database not ready, waiting 5 seconds..."' >> /usr/local/bin/start.sh && \
    echo '  sleep 5' >> /usr/local/bin/start.sh && \
    echo 'done' >> /usr/local/bin/start.sh && \
    echo '' >> /usr/local/bin/start.sh && \
    echo '# Laravel optimizations' >> /usr/local/bin/start.sh && \
    echo 'echo "Optimizing Laravel for production..."' >> /usr/local/bin/start.sh && \
    echo 'php artisan config:cache' >> /usr/local/bin/start.sh && \
    echo 'php artisan route:cache' >> /usr/local/bin/start.sh && \
    echo 'php artisan view:cache' >> /usr/local/bin/start.sh && \
    echo 'php artisan event:cache' >> /usr/local/bin/start.sh && \
    echo '' >> /usr/local/bin/start.sh && \
    echo '# Run migrations' >> /usr/local/bin/start.sh && \
    echo 'echo "Running database migrations..."' >> /usr/local/bin/start.sh && \
    echo 'php artisan migrate --force' >> /usr/local/bin/start.sh && \
    echo '' >> /usr/local/bin/start.sh && \
    echo '# Start supervisor (nginx + php-fpm)' >> /usr/local/bin/start.sh && \
    echo 'echo "Starting nginx and PHP-FPM..."' >> /usr/local/bin/start.sh && \
    echo 'exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf' >> /usr/local/bin/start.sh && \
    chmod +x /usr/local/bin/start.sh

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/up || exit 1

CMD ["/usr/local/bin/start.sh"]