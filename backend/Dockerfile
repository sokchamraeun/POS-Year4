FROM php:8.4-cli

WORKDIR /var/www

# Install system dependencies + nginx + supervisor
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    nginx \
    supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql gd pcntl

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

# Configure Nginx
RUN rm -f /etc/nginx/sites-enabled/default && \
    mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
COPY docker/nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/laravel.conf

# Render only uses ONE port
EXPOSE 10000

# Start all services via supervisor
CMD sh -c "\
php artisan migrate --force && \
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf"