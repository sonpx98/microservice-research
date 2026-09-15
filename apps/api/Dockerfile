# Build context = repo root:  docker build -f apps/api/Dockerfile .
FROM node:20-slim AS builder
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc .pnpmrc ./
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter api
COPY apps/api apps/api
RUN pnpm --filter api build && pnpm --filter api deploy --prod /out

FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl lame ca-certificates \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && pip install --no-cache-dir piper-tts \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /out .

# Voice models used by english-learning conversations (Person A = ryan, Person B = lessac)
ENV PIPER_BIN=/usr/local/bin/piper PIPER_MODELS_DIR=/app/models
RUN mkdir -p models && cd models && for v in ryan lessac; do \
    curl -fsSL -o en_US-$v-low.onnx https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/$v/low/en_US-$v-low.onnx && \
    curl -fsSL -o en_US-$v-low.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/$v/low/en_US-$v-low.onnx.json; \
  done

EXPOSE 3000
CMD ["node", "dist/main.js"]
