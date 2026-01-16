#!/bin/sh

echo "=========================================="
echo "Cron job started at $(date)"
echo "=========================================="

# API 1: Crawler Start
echo "[1/2] Triggering Crawler API..."
curl --max-time 120 -X GET \
  -H "X-API-Key: ${CRAWLER_API_KEY}" \
  "https://crawler-blog.onrender.com/api/start" \
  && echo " ✓ Crawler API success" \
  || echo " ✗ Crawler API failed"

echo ""

# API 2: Gateway Health
echo "[2/2] Triggering Gateway Health API..."
curl --max-time 120 -X GET \
  -H "X-API-Key: ${GATEWAY_API_KEY}" \
  "https://microservice-research.onrender.com/api/health" \
  && echo " ✓ Gateway Health API success" \
  || echo " ✗ Gateway Health API failed"

echo ""
echo "=========================================="
echo "Cron job completed at $(date)"
echo "=========================================="
