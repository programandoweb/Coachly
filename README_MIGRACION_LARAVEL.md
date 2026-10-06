# Migo Fit — migración completa de SQLite a Laravel

El paquete contiene dos carpetas para descomprimir directamente en la raíz del proyecto:

- `backend/`: Laravel 11 con JWT Bearer, migraciones, modelos, controladores, servicios, validaciones y comando de importación.
- `frontend/`: Next.js 15 con las mismas pantallas, sin SQLite y consumiendo Laravel.

## Qué cambió

- Se eliminó por completo `node:sqlite`, `DATABASE_URL`, `dev.db`, WAL/SHM y el script `db:setup` del frontend.
- Laravel ahora es la única fuente de datos.
- Se crearon siete tablas aisladas con prefijo `fit_`:
  - `fit_trainers`
  - `fit_clients`
  - `fit_measurements`
  - `fit_routines`
  - `fit_routine_exercises`
  - `fit_workout_sessions`
  - `fit_workout_set_logs`
- La autenticación usa JWT Bearer mediante el guard `auth:api` existente.
- El token se guarda en una cookie `HttpOnly` de Next.js. No se expone en `localStorage`.
- Todas las actualizaciones nuevas usan `PUT`; no se añadió ningún endpoint `PATCH`.
- Las pantallas y estilos existentes se conservaron.

## 1. Backend Laravel

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Configura en `.env` la base de datos MySQL o PostgreSQL y luego ejecuta:

```bash
php artisan migrate
php artisan fit:import-legacy
php artisan serve --host=0.0.0.0 --port=8000
```

`fit:import-legacy` es idempotente. Puede ejecutarse nuevamente sin duplicar los registros importados.

También puede importarse con el seeder:

```bash
php artisan db:seed --class=MigoFitLegacySeeder
```

### Datos históricos incluidos

El JSON `backend/database/seeders/data/migo_fit_legacy.json` contiene la exportación de la base SQLite entregada:

- 5 usuarios
- 2 entrenadores
- 3 clientes
- 3 rutinas
- 9 ejercicios
- 2 sesiones
- 15 registros de series

Los hashes PBKDF2 anteriores son compatibles durante el primer login. Después de validar la contraseña, Laravel los actualiza automáticamente a su hash nativo.

### Rutas principales

Base: `/api/v1/fit`

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `GET /dashboard`
- `GET|POST /clients`
- `GET|PUT /clients/{id}`
- `POST /clients/{id}/measurements`
- `GET|POST /routines`
- `GET /routines/{id}`
- `POST /routines/{id}/exercises`
- `GET /routines/{id}/workout-report`
- `GET /client/portal`
- `GET /public/routines/{token}`
- `PUT /workout-sets`

## 2. Frontend Next.js

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run build
npm run start
```

Configura:

```env
LARAVEL_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Para desarrollo:

```bash
npm run dev
```

## Cliente y hook Laravel

- `frontend/lib/api/server.ts`: acceso desde Server Components y Server Actions.
- `frontend/hooks/useLaravelApi.ts`: hook para componentes cliente.
- `frontend/app/api/laravel/[...path]/route.ts`: proxy seguro limitado a rutas `fit/*`.
- `frontend/lib/db.ts`: fachada compatible con las pantallas existentes, ahora respaldada por Laravel.

Ejemplo del hook:

```tsx
'use client';

import { useLaravelApi } from '@/hooks/useLaravelApi';

export function Example() {
  const api = useLaravelApi();

  async function loadClients() {
    const data = await api.get<{ clients: unknown[] }>('fit/clients');
    return data.clients;
  }

  return null;
}
```

## Credenciales históricas

Los cinco usuarios contenidos en la base entregada validan inicialmente con la clave:

```text
password
```

Cuando un correo ya existe en la base Laravel antes de importar, se conserva la contraseña que ya tenga ese usuario en Laravel.

## Verificaciones realizadas

- Compilación de producción de Next.js completada correctamente.
- Validación TypeScript estricta completada.
- Validación sintáctica de todos los archivos PHP nuevos completada.
- Validación de 89 relaciones históricas sin referencias huérfanas.
- Confirmación de ausencia de referencias SQLite en el frontend.
