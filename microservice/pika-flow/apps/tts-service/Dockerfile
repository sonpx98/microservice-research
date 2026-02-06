FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN npx nx build tts-service --configuration=production

FROM python:3.9-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Piper
RUN pip install piper-tts

# Copy built app and dependencies
COPY --from=builder /app/apps/tts-service/dist ./dist/apps/tts-service
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create tools directory structure for PiperService to work
# It expects 'tools/piper-venv/bin/piper' OR we modify environment.
# Since we installed piper via pip globally in this image, it's in /usr/local/bin/piper.
# We should probably create a symlink or wrapper to match the expected path, 
# OR use an ENV var. Best is to adjust PiperService to check ENV VAR first.

# Let's create the expected path to avoid code changes for now, or just symlink system piper
RUN mkdir -p tools/piper-venv/bin && \
    ln -s $(which piper) tools/piper-venv/bin/piper

# Create models directory
RUN mkdir -p tools/piper/models

# Expose port
EXPOSE 3333

# Download models during build (Optional, or mount volume)
# For now, let's copy the downloader script and run it if user wants, 
# but usually we want baked-in models for "ready to run" image.
# We will copy the python setup script but modify it to just download models.

COPY tools/setup-piper-python.sh ./tools/setup-piper-python.sh
# We need to tweak the script because it tries to create venv. 
# We'll just manually download the models in the RUN instruction to be efficient.

RUN mkdir -p tools/piper/models && \
    curl -L -o tools/piper/models/en_US-norman-medium.onnx "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/norman/medium/en_US-norman-medium.onnx" && \
    curl -L -o tools/piper/models/en_US-norman-medium.onnx.json "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/norman/medium/en_US-norman-medium.onnx.json" && \
    curl -L -o tools/piper/models/en_US-ljspeech-medium.onnx "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/medium/en_US-ljspeech-medium.onnx" && \
    curl -L -o tools/piper/models/en_US-ljspeech-medium.onnx.json "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/medium/en_US-ljspeech-medium.onnx.json"

CMD ["node", "dist/apps/tts-service/main.js"]
