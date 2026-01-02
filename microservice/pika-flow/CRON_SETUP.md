# Cron Job Setup Guide

Hướng dẫn setup cron job để tự động trigger crawler với API key authentication.

## 1. Setup API Key

### Generate API Key

Tạo một API key ngẫu nhiên và bảo mật:

```bash
# Sử dụng openssl (recommended)
openssl rand -hex 32

# Hoặc sử dụng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Add to Environment Variables

Thêm API key vào file `.env`:

```bash
CRAWLER_API_KEY=your-generated-api-key-here
```

**Lưu ý:** Trên Render, thêm environment variable qua Dashboard:
1. Vào Settings → Environment
2. Add `CRAWLER_API_KEY` với giá trị API key của bạn
3. Save changes

## 2. Test API Locally

```bash
# Test với valid API key
curl -H "X-API-Key: your-api-key" http://localhost:3001/api/start

# Test với invalid API key (should return 401)
curl -H "X-API-Key: wrong-key" http://localhost:3001/api/start

# Test không có API key (should return 401)
curl http://localhost:3001/api/start

# Health endpoint vẫn public (không cần API key)
curl http://localhost:3001/api/health
```

## 3. Setup Cron Job

### Option 1: Render Cron Jobs (Recommended)

Render hỗ trợ cron jobs native:

1. Tạo một cron job service mới trên Render
2. Command:
   ```bash
   curl -H "X-API-Key: $CRAWLER_API_KEY" https://your-crawler-service.onrender.com/api/start
   ```
3. Schedule: Chọn thời gian chạy (ví dụ: mỗi 6 giờ)

### Option 2: External Cron Service

Sử dụng các service như [cron-job.org](https://cron-job.org) hoặc [EasyCron](https://www.easycron.com):

1. **URL**: `https://your-crawler-service.onrender.com/api/start`
2. **Method**: GET
3. **Headers**: 
   - Key: `X-API-Key`
   - Value: `your-api-key`
4. **Schedule**: Cấu hình theo nhu cầu (ví dụ: `0 */6 * * *` = mỗi 6 giờ)

### Option 3: GitHub Actions (Free)

Tạo file `.github/workflows/crawler-cron.yml`:

```yaml
name: Crawler Cron Job

on:
  schedule:
    # Chạy mỗi 6 giờ
    - cron: '0 */6 * * *'
  workflow_dispatch: # Cho phép trigger thủ công

jobs:
  trigger-crawler:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Crawler
        run: |
          curl -H "X-API-Key: ${{ secrets.CRAWLER_API_KEY }}" \
               https://your-crawler-service.onrender.com/api/start
```

**Setup:**
1. Vào GitHub repo → Settings → Secrets and variables → Actions
2. Add secret `CRAWLER_API_KEY` với giá trị API key
3. Commit workflow file

## 4. Recommended Schedule

Với Render Free Plan (15 phút uptime):

- **Mỗi 6 giờ**: `0 */6 * * *` - Cân bằng giữa fresh content và tránh spam
- **Mỗi 12 giờ**: `0 */12 * * *` - Tiết kiệm hơn
- **Mỗi ngày lúc 8AM**: `0 8 * * *` - Crawl vào buổi sáng

## 5. Monitoring

Kiểm tra logs trên Render để verify:
- Cron job trigger thành công
- API key authentication pass
- Crawler hoạt động và crawl đủ bài (~100 bài)
- Jobs được đẩy vào Redis queue

## 6. Security Best Practices

✅ **DO:**
- Sử dụng API key dài và random (ít nhất 32 bytes)
- Lưu API key trong environment variables, không commit vào git
- Rotate API key định kỳ (3-6 tháng)
- Monitor logs để phát hiện unauthorized access

❌ **DON'T:**
- Không share API key publicly
- Không hard-code API key trong code
- Không sử dụng API key đơn giản như "123456"
