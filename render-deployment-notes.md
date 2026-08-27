## Render Laravel deployment notes

Source: https://render.com/docs/deploy-php-laravel-docker

Render's official Laravel Docker guide requires a Render Web Service using Docker, a PostgreSQL database, and environment variables including DATABASE_URL, DB_CONNECTION=pgsql, and APP_KEY. For an existing Laravel app, the guide recommends forcing HTTPS in production, deploying with NGINX and PHP-FPM, using a .dockerignore, and running a startup/deploy script that installs Composer dependencies, caches config/routes, and runs `php artisan migrate --force`.

This repository currently has Laravel files at the root, a React storefront built into `public/build`, and SQLite migrations/seeding for local development. A permanent deployment should use PostgreSQL rather than rely on the ephemeral local SQLite file.
