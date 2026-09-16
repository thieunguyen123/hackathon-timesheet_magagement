#!/usr/bin/env bash
set -e
cd /var/www/html

if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist --no-progress
fi

echo "Waiting for MySQL..."
until php -r 'try { new PDO("mysql:host=".getenv("DB_HOST").";port=".getenv("DB_PORT"), getenv("DB_USERNAME"), getenv("DB_PASSWORD")); } catch (Throwable $e) { exit(1); }'; do
    sleep 3
done

# artisan serve spawns php -S with a scrubbed env, so sync container env into .env
for var in APP_ENV APP_DEBUG APP_URL DB_CONNECTION DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD CACHE_STORE SESSION_DRIVER QUEUE_CONNECTION SLACK_WEBHOOK_URL CONNECTEAM_API_KEY CONNECTEAM_BASE_URL CONNECTEAM_TIMECLOCK_ID; do
    val=$(printenv "$var" 2>/dev/null) || true
    if [ -n "$val" ]; then
        if grep -q "^$var=" .env; then
            sed -i "s|^$var=.*|$var=$val|" .env
        else
            echo "$var=$val" >> .env
        fi
    fi
done

if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    php artisan key:generate --force
fi

php artisan migrate --force --seed

exec php artisan serve --host=0.0.0.0 --port=8000
