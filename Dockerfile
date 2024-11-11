FROM debian:bookworm-slim
RUN apt update -y
RUN apt install nodejs python3 python3-pip npm -y
RUN apt install pipx -y
ENV PATH="$PATH:/root/.local/bin"

RUN pipx install uv
RUN npm install -g pnpm

ENV FLASK_RUN_PORT=8000
ENV FLASK_ENV=production

ARG DATABASE_URL
ARG SCHEMA
ARG SECRET_KEY

WORKDIR /backend
COPY backend/.python-version /backend/
RUN uv python install
COPY backend/uv.lock backend/pyproject.toml /backend/
RUN uv sync --locked

WORKDIR /frontend
COPY frontend/pnpm-lock.yaml frontend/package.json /frontend/
RUN pnpm install --frozen-lockfile

COPY frontend /frontend/
COPY api /api/
RUN pnpm build


COPY backend /backend/
WORKDIR /backend
CMD [ "uv", "run", "gunicorn", "-b", "0.0.0.0", "src:app" ]
