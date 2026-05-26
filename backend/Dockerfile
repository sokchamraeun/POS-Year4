FROM php:8.4-cli

WORKDIR /var/www

# Install system packages
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy project
COPY . .

# Create Laravel folders
RUN mkdir -p \
    bootstrap/cache \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/testing

# Permissions
RUN chmod -R 775 storage bootstrap/cache

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Storage link
RUN php artisan storage:link || true

# Expose ports
# 10000 = Laravel
# 8080 = Reverb WebSocket
EXPOSE 10000
EXPOSE 8080

# Start Laravel + Reverb
CMD php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear && \
    php artisan migrate --force && \
    php artisan db:seed --force && \
    php artisan reverb:start --host=0.0.0.0 --port=8080 & \
    php artisan serve --host=0.0.0.0 --port=10000