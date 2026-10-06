# Validación de autenticación Laravel

Fecha: 2026-07-16

## Causa corregida

La cookie `migo_fit_access_token` es creada por Next.js. Laravel intentaba tratarla como una cookie cifrada por Laravel y podía convertirla en `null` antes de ejecutar el middleware JWT.

## Corrección

- La cookie JWT se excluye explícitamente de `EncryptCookies`.
- `UseFitAccessTokenCookie` toma la cookie y crea `Authorization: Bearer <token>`.
- Se agregó lectura defensiva desde el header Cookie original.
- El cliente HTTP del navegador conserva `credentials: include`.
- El cliente SSR conserva el header Bearer.
- La opción `FIT_AUTH_COOKIE_SECURE` controla expresamente cookies HTTPS; permanece en `false` para localhost.

## Ciclo ejecutado

Se auditaron en bucle todos los endpoints mutables:

- POST auth/logout
- POST auth/refresh
- POST clients
- PUT clients/{client}
- POST clients/{client}/measurements
- POST clients/{client}/routines
- POST routines
- POST routines/{routine}/exercises
- PUT workout-sets

Todos cargan `UseFitAccessTokenCookie` antes de autenticación o procesamiento.

## Pruebas superadas

- Cookie normal -> Authorization Bearer.
- Recuperación desde header Cookie crudo -> Authorization Bearer.
- CORS con credenciales desde localhost:3000.
- TypeScript.
- Compilación de producción Next.js.
- 20 rutas Laravel cargadas.
- Cliente navegador con credenciales en todas las peticiones.
- Cliente SSR con Authorization Bearer.
