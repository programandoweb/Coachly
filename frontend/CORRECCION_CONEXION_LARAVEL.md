# Arquitectura de conexión con Laravel (100% cliente)

Este frontend ya no usa Server Components, Server Actions ni rutas API de
Next.js para hablar con el backend. **Todo el proyecto sigue la filosofía del
hook `useFormData`**: el navegador llama directo a Laravel, el token vive en
`localStorage` (con respaldo en cookie) y cada request arma su propio
`Authorization: Bearer`.

## Piezas clave

- `lib/api/client.ts` → `browserLaravelApi()`: fetch de bajo nivel hacia
  Laravel. Lee el token, arma headers, loguea la petición (activable con
  `NEXT_PUBLIC_FIT_DEBUG_API=true`) y normaliza errores como `LaravelApiError`.
- `hooks/useLaravelApi.ts` → wrapper `get/post/put/delete` para usar dentro de
  componentes.
- `lib/api/fit.ts` → funciones de dominio (`login`, `listClients`,
  `createRoutine`, etc.) que llaman a `browserLaravelApi`. Se pueden usar
  directamente o a través del hook.
- `lib/session.ts` → guarda/lee la sesión (`localStorage.user` + cookie
  `NEXT_PUBLIC_FIT_BROWSER_TOKEN_COOKIE_NAME`), igual que el ejemplo.
- `hooks/useAuthGuard.ts` → reemplaza los antiguos `requireUser` /
  `requireTrainer` / `requireClient` de servidor. Se usa dentro de páginas
  `'use client'` y redirige con `router.replace` si no hay sesión válida.
- Ya **no existen** `app/actions.ts`, `lib/api/server.ts` ni cookies
  `httpOnly`. Todas las páginas bajo `app/` son componentes cliente que hacen
  `fetch` en `useEffect` (o al enviar un formulario) y llevan su propio
  loading/error.

## Variables de entorno

Solo hacen falta las `NEXT_PUBLIC_*`, porque no hay nada corriendo en el
servidor de Next que llame a Laravel:

```env
NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FIT_BROWSER_TOKEN_COOKIE_NAME=coachly_bearer_token
NEXT_PUBLIC_FIT_DEBUG_API=false
```

Laravel debe permitir CORS con credenciales para el origen del frontend
(`NEXT_PUBLIC_APP_URL`) y aceptar el `Authorization: Bearer` que arma el
cliente en cada petición.

Después de cambiar un `.env`:

```bash
npm run build   # o npm run dev
```
