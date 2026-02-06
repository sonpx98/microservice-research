# 🚀 Quick Start - pika-build.sh

## 📦 Script Mở Rộng - Version Auto-Increment

Script `pika-build.sh` giờ có 3 chế độ:

### 1️⃣ Build Locally (No Push)
```bash
./pika-build.sh
```
✅ Chỉ build app + Docker images cục bộ  
✅ Không push lên Docker Hub  
⏱️ ~5-10 phút

---

### 2️⃣ Push Manual Version
```bash
./pika-build.sh --push v1.0.1
```
✅ Build + Push với version cụ thể  
✅ Bạn tự quyết định version  
⏱️ ~10-15 phút

---

### 3️⃣ Push Auto-Increment Version

#### Auto-Detect Current Version
```bash
./pika-build.sh --push
```
✅ Detect version hiện tại từ Docker Hub  
✅ Push với version đó  
✅ Không tăng version  

---

#### Auto-Increment Patch (v1.0.0 → v1.0.1)
```bash
./pika-build.sh --push --auto patch
```
**Dùng khi:** Bug fixes, minor improvements  
**Ví dụ:**
- v1.0.0 → v1.0.1
- v1.5.3 → v1.5.4

---

#### Auto-Increment Minor (v1.0.0 → v1.1.0)
```bash
./pika-build.sh --push --auto minor
```
**Dùng khi:** New features  
**Ví dụ:**
- v1.0.0 → v1.1.0
- v1.5.3 → v1.6.0

---

#### Auto-Increment Major (v1.0.0 → v2.0.0)
```bash
./pika-build.sh --push --auto major
```
**Dùng khi:** Breaking changes  
**Ví dụ:**
- v1.0.0 → v2.0.0
- v1.5.3 → v2.0.0

---

## 📋 Cheat Sheet

| Command | Dùng Khi | Version |
|---------|---------|---------|
| `./pika-build.sh` | Development/Testing | N/A |
| `./pika-build.sh --push` | Just deploy | Auto-detect |
| `./pika-build.sh --push v1.0.1` | Manual version | v1.0.1 |
| `./pika-build.sh --push --auto patch` | Bug fix | Auto +patch |
| `./pika-build.sh --push --auto minor` | New feature | Auto +minor |
| `./pika-build.sh --push --auto major` | Breaking change | Auto +major |

---

## 🎯 Workflow Example

### Development Cycle
```bash
# 1. Develop locally
./pika-build.sh

# 2. Test
docker compose up -d
docker compose logs -f gateway

# 3. Stop
docker compose down
```

### Release Cycle
```bash
# 1. Build + Push (auto-increment patch for bug fix)
./pika-build.sh --push --auto patch

# 2. Verify on Docker Hub
# https://hub.docker.com/r/phamson130998

# 3. Deploy
docker pull phamson130998/pika-gateway:v1.0.1
```

### Version Release
```bash
# Major new features
./pika-build.sh --push --auto minor

# Breaking changes
./pika-build.sh --push --auto major

# Specific version
./pika-build.sh --push v2.5.0-beta
```

---

## 🔍 How It Works

### Auto-Detect
1. Checks local Docker images
2. Checks Git tags
3. Defaults to v1.0.0

### Auto-Increment
1. Gets current version (v1.0.0)
2. Increments specified part (patch/minor/major)
3. New version: v1.0.1 (patch), v1.1.0 (minor), v2.0.0 (major)
4. Builds, tags, and pushes

---

## ✨ Version Example

```
v1.0.0      Initial release
v1.0.1      ← Bug fix (./pika-build.sh --push --auto patch)
v1.0.2      ← Another bug fix
v1.1.0      ← New feature (./pika-build.sh --push --auto minor)
v1.1.1      ← Bug fix
v2.0.0      ← Breaking change (./pika-build.sh --push --auto major)
```

---

## 🚀 One-Liner Examples

```bash
# Build locally
./pika-build.sh

# Build + push v1.0.1
./pika-build.sh --push v1.0.1

# Build + auto-increment patch
./pika-build.sh --push --auto patch

# Build + auto-increment minor
./pika-build.sh --push --auto minor

# Build + auto-increment major
./pika-build.sh --push --auto major

# Show help
./pika-build.sh --help
```

---

## 📊 Full Workflow

```bash
# 1. Make code changes
vim src/...
git add .
git commit -m "fix(gateway): api response handling"

# 2. Build locally to test
./pika-build.sh
docker compose up -d
docker compose logs -f gateway

# 3. If OK, push new version
./pika-build.sh --push --auto patch

# 4. Check Docker Hub
open https://hub.docker.com/r/phamson130998

# 5. Deploy
docker pull phamson130998/pika-gateway:v1.0.1
```

---

## 💡 Tips

1. **Commit before building**
   ```bash
   git add .
   git commit -m "feature/fix message"
   ```

2. **Test locally first**
   ```bash
   ./pika-build.sh
   docker compose up -d
   # ... test ...
   docker compose down
   ```

3. **Then push**
   ```bash
   ./pika-build.sh --push --auto patch
   ```

4. **Tag in git too** (optional)
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

---

**That's it! Happy building! 🎉**
