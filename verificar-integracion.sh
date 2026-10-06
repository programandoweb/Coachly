#!/usr/bin/env bash
set -euo pipefail
BASE_URL="http://localhost:8000/api/v1"

echo "1/3 Verificando Laravel en puerto 8000..."
curl -fsS "$BASE_URL/health" | grep -q '"status":"ok"'

echo "2/3 Probando login JWT..."
TOKEN=$(curl -fsS -X POST "$BASE_URL/fit/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"lic.jorgemendez@gmail.com","password":"password"}' \
  | php -r '$d=json_decode(stream_get_contents(STDIN), true); echo $d["data"]["access_token"] ?? "";')
[ -n "$TOKEN" ]

echo "3/3 Consultando dashboard autenticado..."
curl -fsS "$BASE_URL/fit/dashboard" -H "Authorization: Bearer $TOKEN" | grep -q '"clients"'

echo "INTEGRACION CORRECTA"
