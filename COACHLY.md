# Coachly

Coachly es la edición comercial y multi-entrenador derivada de la base funcional de Migo Fit Trainer.

## Principios de esta rama
- Se conserva la lógica de negocio existente: clientes, rutinas, ejercicios, mediciones, sesiones y progreso.
- Se conserva el esquema interno `fit_*` para evitar migraciones destructivas.
- Branding de producto reemplazado por Coachly.
- PWA, metadatos, login, dashboard, correos y nombres de cookies preparados para producto independiente.
- La rama de trabajo es `coachly-commercial`.

## Configuración sugerida
Frontend:
```env
NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FIT_BROWSER_TOKEN_COOKIE_NAME=coachly_bearer_token
```

Backend:
```env
APP_NAME="Coachly API"
FIT_AUTH_COOKIE_NAME=coachly_access_token
```

## Separación definitiva
Cuando exista el repositorio `programandoweb/Coachly`, esta rama debe convertirse en su `main`.
