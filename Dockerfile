FROM debian:bookworm-slim
RUN apt update -y
RUN apt install nodejs python3 npm pipx -y
ENV PATH="$PATH:/root/.local/bin"

RUN pipx install uv
RUN npm install -g pnpm

ENV FLASK_RUN_PORT=80
ENV FLASK_ENV=production

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
CMD uv run flask db upgrade && uv run flask seed all && uv run gunicorn -b 0.0.0.0:$FLASK_RUN_PORT src:app
