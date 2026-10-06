# Verificación de autenticación Bearer

## Corrección

El login crea dos cookies con el mismo JWT:

- `migo_fit_access_token`: `HttpOnly`, usada por Server Components y Server Actions.
- `migo_fit_bearer_token`: legible por el navegador, usada por `lib/api/client.ts` para construir `Authorization: Bearer <JWT>`.

La segunda cookie existe porque el navegador no puede leer una cookie `HttpOnly`. Sin ella, los formularios cliente llamaban directamente a Laravel sin cabecera Authorization.

## Auditoría del frontend

Todos los accesos HTTP están centralizados en:

- `lib/api/server.ts`: peticiones SSR/Server Actions con Bearer.
- `lib/api/client.ts`: peticiones desde componentes cliente con Bearer.
- `hooks/useLaravelApi.ts`: API única para componentes cliente.

Componentes cliente verificados:

- Drawer de creación de rutina: `POST fit/clients/{id}/routines`.
- Registro de series: `PUT fit/workout-sets`.

Formularios con Server Actions verificados:

- Login y logout.
- Crear y actualizar cliente.
- Crear medición.
- Crear rutina general.
- Crear ejercicio.

## Resultado de compilación

- `npm run build`: correcto.
- TypeScript: correcto.
- Bundle cliente: contiene lectura de `migo_fit_bearer_token` y `Authorization: Bearer`.
- No existen llamadas `fetch` fuera de los dos clientes HTTP centrales.
