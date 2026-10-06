# Validación del drawer de clientes

- El botón `Clientes` del menú abre un drawer desde la derecha.
- Se reutilizaron los mismos campos del formulario anterior de nuevo cliente.
- La creación usa `POST /api/v1/fit/clients` mediante el cliente Laravel centralizado con Bearer Token.
- Al guardar correctamente, el formulario se limpia, el drawer se cierra, se navega a `/dashboard` y se refresca el listado.
- `/dashboard/clientes` redirige a `/dashboard` para mantener el listado de clientes en un único lugar.
- Se mantienen las rutas de detalle `/dashboard/clientes/[id]` y todo el flujo posterior.
- TypeScript y `next build` finalizaron sin errores.
