FROM php:8.4-cli

WORKDIR /var/www

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl unzip \
    libpq-dev \
    libpng-dev libjpeg-dev libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy files (.env is gitignored so not in image)
COPY . .

# Create .env for build-time (dummy, overridden by Render env vars at runtime)
RUN cp .env.example .env && php artisan key:generate

# Create required folders
RUN mkdir -p bootstrap/cache \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views

# Permissions
RUN chmod -R 775 storage bootstrap/cache

# Install PHP packages
RUN composer install --no-dev --optimize-autoloader

# Storage link
RUN php artisan storage:link || true

EXPOSE 10000

# Render env vars override .env at runtime — cache config AFTER that
CMD php artisan migrate --force && \
    php artisan optimize && \
    php artisan serve --host=0.0.0.0 --port=10000
