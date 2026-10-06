# Validación: agregar múltiples ejercicios

- La ruta visible se conserva: `/dashboard/rutinas/[id]`.
- El botón `+` abre el formulario como drawer desde la derecha.
- Después de guardar un ejercicio, la acción redirige a `?exercise=1` y el drawer se vuelve a abrir automáticamente con el formulario limpio.
- Al cerrar el drawer se elimina `exercise=1` de la URL sin recargar la página.
- Los botones de copiar enlace y compartir por WhatsApp permanecen en `RoutineShareActions` y siguen renderizándose antes del botón `+`.
- TypeScript: correcto.
- Next.js producción: compilación correcta.
