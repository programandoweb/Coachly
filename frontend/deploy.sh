#!/usr/bin/env bash
# Deploy del frontend: trae el código, reconstruye sin caché y recrea el contenedor.
# Uso: ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

git pull --ff-only

docker compose build --no-cache
docker compose up -d --force-recreate
