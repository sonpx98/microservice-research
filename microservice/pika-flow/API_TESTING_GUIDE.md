# 🚀 API Testing Guide - Pika Flow

## 📡 Base URL
```
http://localhost:3000
```

## 🔑 Authentication
Tất cả endpoints yêu cầu header `x-api-key`:

```bash
-H "x-api-key: pika-gateway-secret-key-12345"
```

> **API Key**: `pika-gateway-secret-key-12345` (định nghĩa trong `docker-compose.yml`)

---

## ✅ Health Check

### Endpoint
```
GET http://localhost:3000/api/health
```

### Example
```bash
curl -s -H "x-api-key: pika-gateway-secret-key-12345" \
  http://localhost:3000/api/health | jq .
```

### Response
```json
{
  "status": "ok",
  "service": "gateway",
  "timestamp": "2026-01-22T09:35:37.429Z",
  "uptime": 21.008928676
}
```

---

## 📰 News Endpoints

### 1. Get All News
```
GET http://localhost:3000/api/news
```

**Query Parameters:**
- `page` (optional, default: 1) - Trang
- `limit` (optional, default: 10) - Số item per page
- `q` (optional) - Tìm kiếm
- `tag` (optional) - Lọc theo tag

**Example:**
```bash
# Get page 1, 10 items per page
curl -s -H "x-api-key: pika-gateway-secret-key-12345" \
  "http://localhost:3000/api/news?page=1&limit=10" | jq .

# Get page 2, search for "typescript"
curl -s -H "x-api-key: pika-gateway-secret-key-12345" \
  "http://localhost:3000/api/news?page=2&q=typescript" | jq .

# Filter by tag
curl -s -H "x-api-key: pika-gateway-secret-key-12345" \
  "http://localhost:3000/api/news?tag=nodejs" | jq .
```

**Response:**
```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "last_page": 0,
    "total_sources": 0
  }
}
```

---

### 2. Get News Tags
```
GET http://localhost:3000/api/news/tags
```

**Example:**
```bash
curl -s -H "x-api-key: pika-gateway-secret-key-12345" \
  http://localhost:3000/api/news/tags | jq .
```

**Response:**
```json
[]
```

---

### 3. Get News by ID
```
GET http://localhost:3000/api/news/:id
```

**Example:**
```bash
curl -s -H "x-api-key: pika-gateway-secret-key-12345" \
  "http://localhost:3000/api/news/123456" | jq .
```

**Response (if found):**
```json
{
  "_id": "123456",
  "title": "News Title",
  "content": "News content...",
  "tags": ["nodejs", "javascript"],
  "source": "devto",
  "publishedAt": "2026-01-22T09:35:37.429Z"
}
```

**Response (if not found):**
```json
{
  "message": "News not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## 🔄 Ping Endpoint

### Endpoint
```
GET http://localhost:3000/api/ping
```

### Example
```bash
curl -s -H "x-api-key: pika-gateway-secret-key-12345" \
  http://localhost:3000/api/ping | jq .
```

### Response
```json
{
  "message": "pong"
}
```

---

## 📊 Service Ports

| Service | Port | Health Check |
|---------|------|--------------|
| Gateway | 3000 | `GET /api/health` |
| Crawler | 3001 | `GET /api/health` |
| Processor | 3002 | `GET /api/health` |
| MongoDB | 27017 | N/A |
| Redis | 6379 | N/A |

---

## 🛠️ Advanced Usage

### Using curl with Variables

```bash
# Set API Key as variable
API_KEY="pika-gateway-secret-key-12345"
BASE_URL="http://localhost:3000/api"

# Health check
curl -s -H "x-api-key: $API_KEY" "$BASE_URL/health" | jq .

# Get news
curl -s -H "x-api-key: $API_KEY" "$BASE_URL/news?page=1" | jq .
```

### Using Postman / Insomnia

1. **Create new request**
2. **Set method**: GET
3. **Set URL**: `http://localhost:3000/api/health`
4. **Add header**:
   - Key: `x-api-key`
   - Value: `pika-gateway-secret-key-12345`
5. **Send**

---

## 🐛 Troubleshooting

### 401 Unauthorized
```json
{
  "message": "Missing API key",
  "error": "Unauthorized",
  "statusCode": 401
}
```
**Giải pháp**: Thêm header `x-api-key`

### 401 Invalid API Key
```json
{
  "message": "Invalid API key",
  "error": "Unauthorized",
  "statusCode": 401
}
```
**Giải pháp**: Kiểm tra API key, phải là `pika-gateway-secret-key-12345`

### 404 Not Found
```json
{
  "message": "Cannot GET /api/news",
  "error": "Not Found",
  "statusCode": 404
}
```
**Giải pháp**: Kiểm tra endpoint URL

### Connection Refused
```
curl: (7) Failed to connect to localhost port 3000: Connection refused
```
**Giải pháp**: 
```bash
# Kiểm tra containers đang chạy
docker compose ps

# Nếu không chạy, start lại
cd /Users/aeronpham/personal/microservice-research/microservice/pika-flow
docker compose up -d
```

---

## 📝 Notes

- **API Key** trong development là `pika-gateway-secret-key-12345`
- Để thay đổi API Key, sửa `docker-compose.yml` phần `GATEWAY_API_KEY` và restart
- Tất cả timestamps ở UTC
- Pagination: `page` bắt đầu từ 1

---

## 🚀 Quick Start Commands

```bash
# 1. Start all services
cd /Users/aeronpham/personal/microservice-research/microservice/pika-flow
docker compose up -d

# 2. Check status
docker compose ps

# 3. Test health
curl -s -H "x-api-key: pika-gateway-secret-key-12345" http://localhost:3000/api/health | jq .

# 4. Get news
curl -s -H "x-api-key: pika-gateway-secret-key-12345" http://localhost:3000/api/news | jq .

# 5. View logs
docker compose logs -f gateway

# 6. Stop all
docker compose down
```
