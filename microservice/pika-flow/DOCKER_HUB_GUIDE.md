# 📦 Docker Hub Push Guide - Pika Flow

## ✅ Đã Push Thành Công!

**Docker Hub Username**: `phamson130998`

### 📊 Images Pushed

| Service | Repository | Size | Tags |
|---------|------------|------|------|
| **Gateway** | `phamson130998/pika-gateway` | ~227MB | `v1.0.0`, `latest` |
| **Crawler** | `phamson130998/pika-crawler` | ~227MB | `v1.0.0`, `latest` |
| **Processor** | `phamson130998/pika-processor` | ~227MB | `v1.0.0`, `latest` |

---

## 🚀 Pull Images từ Docker Hub

```bash
# Gateway
docker pull phamson130998/pika-gateway:v1.0.0
docker pull phamson130998/pika-gateway:latest

# Crawler
docker pull phamson130998/pika-crawler:v1.0.0
docker pull phamson130998/pika-crawler:latest

# Processor
docker pull phamson130998/pika-processor:v1.0.0
docker pull phamson130998/pika-processor:latest
```

---

## 🔄 Sử Dụng Images từ Docker Hub trong Docker Compose

Thay đổi file `docker-compose.yml` từ local build sang Docker Hub images:

```yaml
services:
  gateway:
    image: phamson130998/pika-gateway:v1.0.0  # Thay vì build locally
    # ... rest of config

  crawler:
    image: phamson130998/pika-crawler:v1.0.0
    # ... rest of config

  processor:
    image: phamson130998/pika-processor:v1.0.0
    # ... rest of config
```

---

## 🐳 Run Containers từ Docker Hub

```bash
# Gateway
docker run -d --name gateway \
  -p 3000:3000 \
  -e GATEWAY_API_KEY=pika-gateway-secret-key-12345 \
  phamson130998/pika-gateway:v1.0.0

# Crawler
docker run -d --name crawler \
  -p 3001:3001 \
  phamson130998/pika-crawler:v1.0.0

# Processor
docker run -d --name processor \
  -p 3002:3002 \
  phamson130998/pika-processor:v1.0.0
```

---

## 📤 Push Images Baru (Khi cập nhật code)

### Step 1: Build lại images
```bash
cd /Users/aeronpham/personal/microservice-research/microservice/pika-flow
pnpm run docker:build:all
```

### Step 2: Tag với version mới
```bash
# Ví dụ: v1.0.1
docker tag pika-gateway:latest phamson130998/pika-gateway:v1.0.1
docker tag pika-crawler:latest phamson130998/pika-crawler:v1.0.1
docker tag pika-processor:latest phamson130998/pika-processor:v1.0.1

# Cập nhật latest tag
docker tag pika-gateway:latest phamson130998/pika-gateway:latest
docker tag pika-crawler:latest phamson130998/pika-crawler:latest
docker tag pika-processor:latest phamson130998/pika-processor:latest
```

### Step 3: Push lên Docker Hub
```bash
# Push version cụ thể
docker push phamson130998/pika-gateway:v1.0.1
docker push phamson130998/pika-crawler:v1.0.1
docker push phamson130998/pika-processor:v1.0.1

# Update latest tag
docker push phamson130998/pika-gateway:latest
docker push phamson130998/pika-crawler:latest
docker push phamson130998/pika-processor:latest
```

---

## 🔐 Docker Hub Login

```bash
# Login (một lần)
docker login

# Logout (nếu cần)
docker logout
```

---

## 🌐 View trên Docker Hub

**Gateway**:
https://hub.docker.com/r/phamson130998/pika-gateway

**Crawler**:
https://hub.docker.com/r/phamson130998/pika-crawler

**Processor**:
https://hub.docker.com/r/phamson130998/pika-processor

---

## 📝 Versioning Strategy

Khuyến cáo sử dụng semantic versioning:

```
v<MAJOR>.<MINOR>.<PATCH>

v1.0.0  - Major release
v1.0.1  - Patch (bug fixes)
v1.1.0  - Minor (new features)
v2.0.0  - Major (breaking changes)
```

---

## 🚀 Production Deployment

Khi deploy lên production:

```bash
# Tạo docker-compose.prod.yml
version: '3.8'

services:
  gateway:
    image: phamson130998/pika-gateway:v1.0.0  # Use specific version
    restart: always
    # ... config

  crawler:
    image: phamson130998/pika-crawler:v1.0.0
    restart: always
    # ... config

  processor:
    image: phamson130998/pika-processor:v1.0.0
    restart: always
    # ... config

# Deploy
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔍 Kiểm Tra Images trên Local

```bash
# List all images
docker images | grep phamson130998

# Inspect image
docker inspect phamson130998/pika-gateway:v1.0.0

# History
docker history phamson130998/pika-gateway:v1.0.0
```

---

## 🛠️ Troubleshooting

### Push fails với "unauthorized"
```bash
docker logout
docker login
# Nhập username & password
```

### Image too large
```bash
# Kiểm tra image size
docker inspect phamson130998/pika-gateway:v1.0.0 | grep -i size

# Optimize Dockerfile (multi-stage build) ✅ Đã dùng rồi
```

### Network timeout
```bash
# Thử lại push
docker push phamson130998/pika-gateway:v1.0.0

# Hoặc push từng cái
docker push phamson130998/pika-gateway:v1.0.0 --quiet
```

---

## 📊 Quick Reference

| Command | Purpose |
|---------|---------|
| `docker build` | Build images locally |
| `docker tag` | Tag images |
| `docker push` | Push to Docker Hub |
| `docker pull` | Pull from Docker Hub |
| `docker login` | Authenticate với Docker Hub |
| `docker logout` | Logout |
| `docker images` | List images |
| `docker inspect` | Check image details |

---

## 🎯 Current Status

✅ **Gateway**: v1.0.0 - PUSHED  
✅ **Crawler**: v1.0.0 - PUSHED  
✅ **Processor**: v1.0.0 - PUSHED  

All images are ready for production deployment! 🚀
