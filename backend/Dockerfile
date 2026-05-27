FROM php:8.4-cli

WORKDIR /var/www

# Install system packages + PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql gd pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . .

# Create Laravel directories
RUN mkdir -p \
    bootstrap/cache \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/testing

# Permissions
RUN chmod -R 775 storage bootstrap/cache

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Laravel optimization (safe for production build)
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

# Storage link
RUN php artisan storage:link || true

# Expose ports
EXPOSE 10000
EXPOSE 8080

# Start Laravel + Reverb
CMD sh -c "\
php artisan migrate --force && \
php artisan reverb:start --host=0.0.0.0 --port=8080 & \
php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"