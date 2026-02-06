# 🐳 Hướng Dẫn Docker Build - Pika Flow

## ✅ Các Lỗi Đã Sửa

### 1. **Lỗi: No package.json found in /app**
**Nguyên nhân**: Dockerfile cũ chỉ copy thư mục `dist` mà không có dependencies.

**Giải pháp**: Sử dụng multi-stage build:
- **Stage 1 (Builder)**: Install dependencies và build với Nx
- **Stage 2 (Runtime)**: Copy built code và install production dependencies

### 2. **Lỗi: /workspace/dist/apps/crawler not found**
**Nguyên nhân**: Nx với webpack build vào `apps/{service}/dist`, không phải `dist/apps/{service}`.

**Giải pháp**: Sửa COPY path trong Dockerfile:
```dockerfile
# ❌ SAI
COPY --from=builder /workspace/dist/apps/crawler ./dist

# ✅ ĐÚNG
COPY --from=builder /workspace/apps/crawler/dist ./dist
```

### 3. **Lỗi: Cannot find module 'tslib'**
**Nguyên nhân**: `tslib` ở trong devDependencies, nhưng runtime cần nó.

**Giải pháp**: Move `tslib` từ devDependencies sang dependencies trong `package.json`.

### 4. **Lỗi: Docker build context sai**
**Nguyên nhân**: Build từ `apps/crawler` nhưng context là `../../`.

**Giải pháp**: Build từ root của monorepo với absolute path hoặc từ pika-flow folder:
```bash
# Cách 1: Relative path (phải ở trong pika-flow/)
docker build -t pika-crawler:latest -f apps/crawler/Dockerfile .

# Cách 2: Absolute path (chạy từ đâu cũng được)
docker build -t pika-crawler:latest \
  -f /path/to/microservice/pika-flow/apps/crawler/Dockerfile \
  /path/to/microservice/pika-flow
```

---

## 🚀 Cách Sử Dụng

### Build Single Service

```bash
# Di chuyển vào thư mục pika-flow
cd microservice/pika-flow

# Build crawler
pnpm run docker:build:crawler

# Build gateway
pnpm run docker:build:gateway

# Build processor
pnpm run docker:build:processor
```

### Build All Services

```bash
cd microservice/pika-flow
pnpm run docker:build:all
```

### Chạy với Docker Compose

```bash
cd microservice/pika-flow

# Start tất cả services (MongoDB, Redis, Gateway, Crawler, Processor)
docker compose up -d

# Xem logs
docker compose logs -f

# Stop tất cả
docker compose down

# Stop và xóa volumes
docker compose down -v
```

---

## 📦 Cấu Trúc Dockerfile

### Multi-Stage Build Pattern

```dockerfile
# Stage 1: Builder - Build application
FROM docker.io/node:lts-alpine AS builder
WORKDIR /workspace

# Enable pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/crawler/package.json ./apps/crawler/

# Install ALL dependencies (dev + prod)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tsconfig.base.json nx.json ./
COPY apps/crawler ./apps/crawler
COPY libs ./libs

# Build with Nx
RUN pnpm exec nx build crawler --prod

# Stage 2: Runtime - Production image
FROM docker.io/node:lts-alpine
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/crawler/package.json ./apps/crawler/

# Install ONLY production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /workspace/apps/crawler/dist ./dist

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

# Start application
CMD ["node", "dist/main.js"]
```

---

## 🔧 Environment Variables

### Gateway (Port 3000)
```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
MONGO_URI=mongodb://user:password@mongo:27017
REDIS_HOST=redis
REDIS_PORT=6379
```

### Crawler (Port 3001)
```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3001
MONGO_URI=mongodb://user:password@mongo:27017
REDIS_HOST=redis
REDIS_PORT=6379
```

### Processor (Port 3002)
```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3002
MONGO_URI=mongodb://user:password@mongo:27017
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## 🐞 Troubleshooting

### 1. Build fails với "frozen-lockfile" error
```bash
# Update lockfile
cd microservice/pika-flow
pnpm install

# Rebuild Docker image
pnpm run docker:build:crawler
```

### 2. Container không start - "port already allocated"
```bash
# Kiểm tra port nào đang chạy
lsof -i :3001

# Kill process đang dùng port
kill -9 <PID>

# Hoặc dùng port khác
docker run -p 3011:3001 pika-crawler:latest
```

### 3. "Cannot find module" errors
- Kiểm tra module có trong `dependencies` (không phải `devDependencies`)
- Update lockfile: `pnpm install`
- Rebuild image: `pnpm run docker:build:crawler`

### 4. Build slow / timeout
```bash
# Xóa Docker build cache
docker builder prune -a

# Build lại
pnpm run docker:build:crawler
```

---

## 📝 Production Deployment

### Build for Production

```bash
# Build tất cả services
pnpm run docker:build:all

# Tag images cho registry
docker tag pika-crawler:latest your-registry.com/pika-crawler:v1.0.0
docker tag pika-gateway:latest your-registry.com/pika-gateway:v1.0.0
docker tag pika-processor:latest your-registry.com/pika-processor:v1.0.0

# Push to registry
docker push your-registry.com/pika-crawler:v1.0.0
docker push your-registry.com/pika-gateway:v1.0.0
docker push your-registry.com/pika-processor:v1.0.0
```

### Health Checks

Tất cả services đều có health check endpoint tại `/health`:

```bash
# Check crawler
curl http://localhost:3001/health

# Check gateway
curl http://localhost:3000/health

# Check processor
curl http://localhost:3002/health
```

---

## 🎯 Best Practices

1. **Luôn build từ root của monorepo** - Context phải là thư mục `pika-flow/`

2. **Update lockfile sau khi thay đổi dependencies**
   ```bash
   pnpm install
   ```

3. **Use multi-stage builds** - Giảm image size và tăng security

4. **Separate build và runtime dependencies** - Chỉ install prod deps trong final image

5. **Health checks** - Đảm bảo container ready trước khi nhận traffic

6. **Environment-specific configs** - Dùng env variables thay vì hard-code

---

## 📊 Image Sizes

Sau khi optimize với multi-stage build:

- **pika-crawler**: ~180MB
- **pika-gateway**: ~180MB  
- **pika-processor**: ~180MB

Nhỏ hơn nhiều so với cách build thông thường (~500MB+) nhờ:
- Alpine Linux base image
- Production dependencies only
- Multi-stage build pattern
