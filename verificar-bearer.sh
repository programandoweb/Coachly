#!/usr/bin/env sh
set -eu

FRONTEND="${1:-frontend}"

fail() { echo "ERROR: $1" >&2; exit 1; }

[ -f "$FRONTEND/lib/api/client.ts" ] || fail "No existe cliente HTTP del navegador"
[ -f "$FRONTEND/lib/api/server.ts" ] || fail "No existe cliente HTTP del servidor"
[ -f "$FRONTEND/lib/auth.ts" ] || fail "No existe gestor de sesión"

grep -Fq 'migo_fit_bearer_token' "$FRONTEND/lib/api/client.ts" || fail "El cliente no lee la cookie Bearer"
grep -Fq "headers.set('Authorization', \`Bearer" "$FRONTEND/lib/api/client.ts" || fail "El cliente no agrega Authorization Bearer"
grep -Fq 'httpOnly: false' "$FRONTEND/lib/auth.ts" || fail "El login no emite cookie legible para el cliente"
grep -Fq 'httpOnly: true' "$FRONTEND/lib/auth.ts" || fail "Falta cookie HttpOnly para SSR"
grep -Fq "requestHeaders.set('Authorization', \`Bearer" "$FRONTEND/lib/api/server.ts" || fail "SSR no agrega Bearer"

DIRECT_FETCH=$(grep -R "fetch(" -n "$FRONTEND/app" "$FRONTEND/components" "$FRONTEND/hooks" "$FRONTEND/lib" --include='*.ts' --include='*.tsx' | grep -v "$FRONTEND/lib/api/client.ts" | grep -v "$FRONTEND/lib/api/server.ts" || true)
[ -z "$DIRECT_FETCH" ] || fail "Hay fetch directos fuera de los clientes centrales:\n$DIRECT_FETCH"

echo "OK: todas las peticiones están centralizadas y ambos clientes agregan Bearer."
