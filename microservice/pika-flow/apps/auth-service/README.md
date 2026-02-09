# Auth Service

Authentication Microservice built with Golang and Gin.

## Setup

1.  **Initialize Go Module**
    Since the Go binary was not found during setup, you need to run the following commands manually in this directory:
    ```bash
    go mod tidy
    ```

2.  **Configuration**
    The service will automatically try to load configuration from:
    1. `.env` in the current directory (overrides others).
    2. `../../.env.development.local` (monorepo dev config).
    3. `../../.env` (monorepo root config).

    You can share the root configuration or create a local `.env` to override specific values.
    
    Required variables:
    - `RESEND_API_KEY`
    - `MONGO_URI`
    - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_TLS`

## Build and Run

```bash
go run cmd/server/main.go
```

## API Endpoints

- curl -X POST http://localhost:3007/auth/otp \
  -H "Content-Type: application/json" \
  -d '{"email": "[EMAIL_ADDRESS]"}'

- curl -X POST http://localhost:3007/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "[EMAIL_ADDRESS]", "otp": "123456"}'

**Note**: The service runs on port **3007** by default.
