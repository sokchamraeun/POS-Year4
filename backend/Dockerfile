FROM php:8.4-cli

WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ca-certificates \
    unzip \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql gd pcntl zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy project
COPY . .

# Create Laravel required folders
RUN mkdir -p \
    bootstrap/cache \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs

# Permissions
RUN chmod -R 775 storage bootstrap/cache

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Optimize Laravel (safe for production)
RUN php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear

# Storage link
RUN php artisan storage:link || true

EXPOSE 10000

CMD sh -c "\
php artisan migrate --force && \
php artisan db:seed --force && \
php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"
