# Cronómetro global persistente

## Implementación

- El botón se muestra únicamente cuando la rutina tiene al menos un ejercicio.
- Estado inicial: `Iniciar cronómetro`.
- Estado activo: `Finalizar entrenamiento`.
- El inicio se guarda en `fit_workout_sessions.started_at`.
- Al finalizar se guardan `ended_at` y `duration_seconds`.
- Al volver a abrir `/dashboard/rutinas/{id}`, Next obtiene la última sesión desde Laravel.
- Si la sesión sigue activa, el tiempo se calcula desde `started_at`; no depende de localStorage.

## Endpoint

```text
PUT /api/v1/fit/routines/{routine}/workout-session
```

Inicio:

```json
{"action":"start"}
```

Finalización:

```json
{"action":"finish"}
```

## Instalación

```bash
cd backend
composer install
php artisan optimize:clear
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000
```

```bash
cd frontend
npm install
rm -rf .next
npm run dev
```

## Validaciones realizadas

- Sintaxis PHP de modelos, controladores, rutas y migraciones.
- TypeScript sin errores.
- Compilación completa de producción con Next.js.
- Simulación de una sesión iniciada cinco minutos atrás: restauración en 300 segundos.
- Revisión del render condicional: el botón no existe con cero ejercicios.
