# Migo Fit Trainer — Backend Laravel limpio

API Laravel 11 mínima para el frontend existente. No contiene módulos heredados ni migraciones ajenas.

## Únicas migraciones

- `users`
- `fit_clients`, `fit_measurements`, `fit_routines`, `fit_routine_exercises`, `fit_workout_sets`

## Instalación

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret --force
```

Configure MySQL en `.env`, cree la base indicada y ejecute:

```bash
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

Prueba de conexión:

```bash
curl http://localhost:8000/api/v1/health
```

Credenciales demo:

- `lic.jorgemendez@gmail.com` / `password`
- `brian@gmail.com` / `password`
- `cliente@migo.fit` / `password`
