# API Cron Job

Scheduled API triggers running in Docker.

## Schedule
- **Time:** 2:15 AM và 2:20 AM (Vietnam time)
- **Days:** Monday, Wednesday, Friday
- **Timeout:** 90 seconds per request

## APIs Triggered
1. Crawler Start: `https://crawler-blog.onrender.com/api/start`
2. Gateway Health: `https://microservice-research.onrender.com/api/health`

## Setup

```bash
# 1. Copy env file and fill in API keys
cp .env.example .env

# 2. Build and run
docker compose up -d --build

# 3. Check logs
docker compose logs -f
```

## If there is any changes in scripts, just run to update. Build process is not required.

```bash
docker compose up -d
```

## Test trigger manually

```bash
docker compose exec cron /scripts/trigger.sh
```
