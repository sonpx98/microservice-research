# 🚀 Build & Deploy Scripts - Pika Flow

## 📋 Available Scripts

### 1️⃣ `build-local.sh` - Local Development Build
**Chỉ build app + Docker images (không push)**

```bash
./build-local.sh
```

**Làm gì:**
- ✅ Check prerequisites (Docker, pnpm)
- ✅ Install dependencies
- ✅ Build 3 NestJS apps (gateway, crawler, processor)
- ✅ Create Docker images

**Thời gian:** ~5-10 phút (lần đầu)

**Khi sử dụng:**
- 🔧 Development/testing
- 🐛 Debugging locally
- 🧪 Staging environment

**Output:**
```
✅ pika-gateway:latest
✅ pika-crawler:latest
✅ pika-processor:latest
```

---

### 2️⃣ `push-to-docker-hub.sh` - Push Existing Images
**Tag + Push images đã build sẵn lên Docker Hub**

```bash
./push-to-docker-hub.sh [version]
```

**Ví dụ:**
```bash
./push-to-docker-hub.sh v1.0.0
./push-to-docker-hub.sh v1.0.1
./push-to-docker-hub.sh v2.0.0-beta
```

**Nếu không specify version:**
```bash
./push-to-docker-hub.sh
# Mặc định dùng v1.0.0
```

**Làm gì:**
- ✅ Check Docker Hub authentication
- ✅ Tag images với version và latest
- ✅ Push lên Docker Hub
- ✅ Verify images

**Thời gian:** ~3-5 phút

**Khi sử dụng:**
- 🚀 Production release
- 📦 Distribute images
- 🌐 Share với team

---

### 3️⃣ `build-and-push.sh` - Complete Pipeline (A-Z)
**Build + Tag + Push tất cả trong 1 command**

```bash
./build-and-push.sh [version]
```

**Ví dụ:**
```bash
./build-and-push.sh v1.0.1
./build-and-push.sh v1.1.0
./build-and-push.sh v2.0.0
```

**Làm gì:**
1. ✅ Check prerequisites
2. ✅ Docker Hub authentication
3. ✅ Install dependencies
4. ✅ Build NestJS apps
5. ✅ Create Docker images
6. ✅ Tag images
7. ✅ Push to Docker Hub
8. ✅ Verify & generate deployment info

**Thời gian:** ~10-15 phút (lần đầu)

**Khi sử dụng:**
- 🎯 Production release workflow
- ⚡ CI/CD pipeline
- 🔄 Automation

**Output:**
- 📦 Docker images pushed
- 📄 `DEPLOYMENT_INFO.txt` generated
- 🌐 Docker Hub links

---

## 🔑 Prerequisites

```bash
# Check Docker
docker --version

# Check pnpm
pnpm --version

# Check Docker daemon
docker ps
```

---

## 📖 Usage Guide

### Step 1: Local Development
```bash
./build-local.sh
```

### Step 2: Test Locally
```bash
docker compose up -d
docker compose logs -f gateway
```

### Step 3: When Ready to Release
```bash
./build-and-push.sh v1.0.1
```

Or separately:
```bash
# Just tag & push
./push-to-docker-hub.sh v1.0.1
```

---

## 🔐 Docker Hub Login

Scripts will auto-prompt if not logged in:

```bash
# Manual login
docker login

# Provide username: phamson130998
# Provide password: (your password)
```

---

## 📊 Version Format

Use semantic versioning:

```
v<MAJOR>.<MINOR>.<PATCH>

v1.0.0   ✅ Initial release
v1.0.1   ✅ Bug fix
v1.1.0   ✅ New feature
v2.0.0   ✅ Breaking change
```

---

## 🐛 Troubleshooting

### Script Permission Denied
```bash
chmod +x build-local.sh
chmod +x push-to-docker-hub.sh
chmod +x build-and-push.sh
```

### Docker Daemon Not Running
```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
```

### Not Logged in to Docker Hub
```bash
docker login
# Enter username: phamson130998
# Enter password: (your password)
```

### Build Fails
```bash
# Clear cache
docker builder prune -a
pnpm install --frozen-lockfile

# Try again
./build-local.sh
```

### Push Fails
```bash
# Check network
docker pull hello-world

# Check auth
docker logout
docker login

# Try again
./push-to-docker-hub.sh v1.0.0
```

---

## 🎯 Common Workflows

### Development Workflow
```bash
# 1. Build locally
./build-local.sh

# 2. Start services
docker compose up -d

# 3. Test changes
curl -H "x-api-key: pika-gateway-secret-key-12345" http://localhost:3000/api/health

# 4. Stop services
docker compose down
```

### Release Workflow
```bash
# 1. Make code changes
# 2. Commit & push to git
# 3. Tag version
git tag v1.0.1
git push origin v1.0.1

# 4. Build & push
./build-and-push.sh v1.0.1

# 5. Verify on Docker Hub
# https://hub.docker.com/r/phamson130998
```

### CI/CD Integration
```bash
# In your CI/CD pipeline
./build-and-push.sh ${VERSION}

# Where VERSION comes from:
# - Git tag
# - Build number
# - Manual input
```

---

## 📝 Configuration

### Change Docker Hub Username
Edit scripts and replace:
```bash
DOCKER_HUB_USER="phamson130998"
```

With your username:
```bash
DOCKER_HUB_USER="your-username"
```

### Change Services
Edit scripts and modify:
```bash
SERVICES=("gateway" "crawler" "processor")
```

---

## 📊 Quick Reference

| Script | Build | Test | Push | Time |
|--------|-------|------|------|------|
| `build-local.sh` | ✅ | ✅ | ❌ | 5-10m |
| `push-to-docker-hub.sh` | ❌ | ❌ | ✅ | 3-5m |
| `build-and-push.sh` | ✅ | ✅ | ✅ | 10-15m |

---

## 🚀 Example: Complete Release

```bash
# 1. Build everything & push to Docker Hub
./build-and-push.sh v1.0.1

# 2. Verify on Docker Hub
open https://hub.docker.com/r/phamson130998/pika-gateway

# 3. Pull & test in production
docker pull phamson130998/pika-gateway:v1.0.1
docker run -d -p 3000:3000 phamson130998/pika-gateway:v1.0.1

# 4. Update docker-compose.yml
# Change: image: pika-gateway:latest
# To:     image: phamson130998/pika-gateway:v1.0.1

# 5. Deploy
docker compose down && docker compose up -d
```

---

## 📞 Support

For issues:
1. Check logs: `docker compose logs -f`
2. Check Docker: `docker ps -a`
3. Run cleanup: `docker system prune`
4. Try again: `./build-local.sh`

---

**Happy deploying! 🎉**
