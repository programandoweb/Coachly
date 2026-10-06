# Coachly — Frontend Next.js

Se conservaron las rutas y el diseño originales. El frontend no contiene SQLite ni lógica de persistencia.

Arquitectura 100% cliente: no hay Server Components, Server Actions ni rutas
API de Next.js hablando con Laravel. Cada página se renderiza como shell
estático y hace `fetch` directo a Laravel desde el navegador, con el token
guardado en `localStorage` (respaldado en cookie) — la misma filosofía del
hook `useFormData` de referencia. Ver `CORRECCION_CONEXION_LARAVEL.md` para
el detalle completo.

## Ejecutar

```bash
npm install
npm run dev
```

Laravel debe estar activo en `http://localhost:8000`.

```env
NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FIT_BROWSER_TOKEN_COOKIE_NAME=coachly_bearer_token
NEXT_PUBLIC_FIT_DEBUG_API=false
```

- `lib/api/client.ts`: fetch de bajo nivel del navegador directo a Laravel (con logs opcionales).
- `lib/api/fit.ts`: única fachada de negocio para el frontend (login, clientes, rutinas, mediciones...).
- `hooks/useLaravelApi.ts`: hook genérico `get/post/put/delete` para componentes cliente.
- `lib/session.ts`: guarda/lee el usuario y el token en `localStorage` + cookie.
- `hooks/useAuthGuard.ts`: guard de sesión para páginas protegidas (reemplaza los antiguos `requireUser/requireTrainer/requireClient` de servidor).

No existe proxy interno de Next y no existe ninguna base de datos local en el frontend.
