@echo off
title Migo Dashboard - Fit y Frontend LAN

:: Iniciar Fit Laravel en toda la red
start "Migo Fit Laravel" cmd /K "cd /d D:\migo-fit-trainer-pwa\backend && php artisan serve --host=0.0.0.0 --port=8000"

:: Iniciar frontend Next.js en toda la red
start "Migo Frontend Next" cmd /K "cd /d D:\migo-fit-trainer-pwa\frontend && npm run dev -- -H 0.0.0.0 -p 3000"

echo ---------------------------------------------------
echo  Migo Dashboard ejecutandose en red local
echo.
echo  Backend:  http://TU_IP_LOCAL:8000
echo  Frontend: http://TU_IP_LOCAL:3000
echo ---------------------------------------------------
pause