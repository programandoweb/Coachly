# Reorganización de medidas antropométricas

## Cambios

El formulario y el historial quedaron separados en tres grupos:

1. Datos generales: peso, talla, grasa corporal y masa muscular.
2. Pliegues cutáneos (mm): tríceps, subescapular, suprailíaco, abdominal, muslo y pantorrilla.
3. Perímetros corporales (cm): brazo relajado, brazo contraído, tórax, cintura, cadera, muslo y pantorrilla.

La migración es aditiva: no elimina ni modifica las columnas antropométricas anteriores.

## Instalación

Copiar `backend/` sobre la raíz del backend Laravel y `frontend/` sobre la raíz del frontend Next.js.

Ejecutar en el backend:

```bash
php artisan migrate
php artisan optimize:clear
```

En el frontend:

```bash
npm install
npm run build
```

## Validación realizada

Los archivos PHP modificados y la migración fueron validados con `php -l` sin errores de sintaxis.
El chequeo TypeScript no pudo completarse en el ZIP fuente porque no contiene `node_modules`; los errores reportados corresponden a dependencias no instaladas (`react`, `next`, `motion/react` y tipos de Node), no a los archivos modificados.
