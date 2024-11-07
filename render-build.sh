#!/bin/bash

set -euo pipefail

set -x

cd frontend
  pnpm i
  pnpm build
cd ..

cd backend
  pip install uv psycopg2 gunicorn
  uv sync
  uv run flask db upgrade
  uv run flask seed all
  uv run gunicorn src:app
cd ..
