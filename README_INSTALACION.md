# Migo Fit Trainer — instalación limpia

El ZIP contiene exactamente dos proyectos completos en la raíz:

- `backend/`: Laravel 11, API en el puerto 8000.
- `frontend/`: Next.js 15, interfaz en el puerto 3000.

Las rutas visibles y el diseño del frontend se conservaron. Se eliminaron SQLite, el proxy interno de Next y todos los módulos Laravel ajenos a Migo Fit.

## 1. Base de datos

Cree una base MySQL vacía:

```sql
CREATE DATABASE fit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Revise `backend/.env` si su usuario o contraseña MySQL son diferentes.

## 2. Laravel

```bash
cd backend
composer install
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

Compruebe:

```text
http://localhost:8000/api/v1/health
```

## 3. Frontend

En otra consola:

```bash
cd frontend
npm install
npm run dev
```

Abra:

```text
http://localhost:3000/login
```

Credenciales:

```text
lic.jorgemendez@gmail.com
password
```

## Verificación automatizada

Con ambos servicios activos, ejecute desde la raíz en PowerShell:

```powershell
.\verificar-integracion.ps1
```

La prueba consulta salud, inicia sesión contra Laravel y consulta el dashboard autenticado.
