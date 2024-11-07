#!/bin/bash

set -euo pipefail

set -x

cd frontend
  pnpm i
  pnpm build
cd ..

cd backend
  pip install uv psycopg2 gunicorn
  uv export > requirements.txt
  pip install -r requirements.txt
  flask db upgrade
  flask seed all
cd ..
