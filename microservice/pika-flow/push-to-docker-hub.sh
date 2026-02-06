#!/bin/bash

# 🐳 Docker Hub Push Script for Pika Flow
# Usage: ./push-to-docker-hub.sh [version]
# Example: ./push-to-docker-hub.sh v1.0.1

set -e

DOCKER_HUB_USER="phamson130998"
SERVICES=("gateway" "crawler" "processor")
VERSION="${1:-v1.0.0}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Pika Flow - Docker Hub Push Script${NC}"
echo -e "${BLUE}=====================================\n${NC}"

# Check if logged in
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon not running${NC}"
    exit 1
fi

# Check Docker Hub authentication
if docker auth info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Not logged in to Docker Hub${NC}"
    echo -e "${YELLOW}Running: docker login${NC}"
    docker login
fi

echo -e "${YELLOW}📌 Version: $VERSION${NC}\n"

# Function to tag image
tag_image() {
    local service=$1
    local image_name="pika-${service}:latest"
    local docker_hub_url="$DOCKER_HUB_USER/pika-${service}"
    
    echo -e "${BLUE}🏷️  Tagging: $image_name${NC}"
    docker tag "$image_name" "$docker_hub_url:$VERSION"
    docker tag "$image_name" "$docker_hub_url:latest"
    echo -e "${GREEN}✅ Tagged: $docker_hub_url:$VERSION${NC}"
    echo -e "${GREEN}✅ Tagged: $docker_hub_url:latest${NC}\n"
}

# Function to push image
push_image() {
    local service=$1
    local docker_hub_url="$DOCKER_HUB_USER/pika-${service}"
    
    echo -e "${BLUE}📤 Pushing: $docker_hub_url:$VERSION${NC}"
    docker push "$docker_hub_url:$VERSION"
    echo -e "${GREEN}✅ Pushed: $docker_hub_url:$VERSION${NC}\n"
    
    echo -e "${BLUE}📤 Pushing: $docker_hub_url:latest${NC}"
    docker push "$docker_hub_url:latest"
    echo -e "${GREEN}✅ Pushed: $docker_hub_url:latest${NC}\n"
}

# Tag all services
echo -e "${BLUE}🏷️  Tagging images...${NC}\n"
for service in "${SERVICES[@]}"; do
    tag_image "$service"
done

# Push all services
echo -e "${BLUE}📤 Pushing images to Docker Hub...${NC}\n"
for service in "${SERVICES[@]}"; do
    push_image "$service"
done

# Summary
echo -e "${BLUE}=====================================\n${NC}"
echo -e "${GREEN}✅ All images pushed successfully!${NC}\n"

echo -e "${YELLOW}📊 Summary:${NC}"
for service in "${SERVICES[@]}"; do
    echo -e "  • ${GREEN}$DOCKER_HUB_USER/pika-$service:$VERSION${NC}"
    echo -e "  • ${GREEN}$DOCKER_HUB_USER/pika-$service:latest${NC}"
done

echo -e "\n${YELLOW}🌐 View on Docker Hub:${NC}"
for service in "${SERVICES[@]}"; do
    echo -e "  https://hub.docker.com/r/$DOCKER_HUB_USER/pika-$service"
done

echo -e "\n${YELLOW}📥 Pull images:${NC}"
for service in "${SERVICES[@]}"; do
    echo -e "  docker pull $DOCKER_HUB_USER/pika-$service:$VERSION"
done

echo -e "\n${GREEN}🎉 Done!${NC}\n"
