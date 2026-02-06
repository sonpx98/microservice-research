#!/bin/bash

# 🚀 Pika Flow - Universal Build Script
# Usage:
#   ./pika-build.sh                          # Build all apps (local, native platform)
#   ./pika-build.sh --app crawler            # Build only crawler
#   ./pika-build.sh --app gateway --push     # Build and push only gateway
#   ./pika-build.sh --intel                  # Build for Intel/AMD64
#   ./pika-build.sh --push                   # Build + Push (auto-detect version)
#   ./pika-build.sh --push v1.0.1            # Build + Push with specific version
#   ./pika-build.sh --push --auto patch      # Build + Push (auto-increment patch)
#   ./pika-build.sh --push --auto minor      # Build + Push (auto-increment minor)
#   ./pika-build.sh --push --auto major      # Build + Push (auto-increment major)
#   ./pika-build.sh --intel --push v1.0.1    # Build for Intel + Push

set -e

# Configuration
DOCKER_HUB_USER="phamson130998"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALL_SERVICES=("gateway" "crawler" "processor")
SERVICES=()
VERSION=""
PUSH_TO_HUB=""
AUTO_INCREMENT=""
INCREMENT_TYPE=""
BUILD_PLATFORM=""
SPECIFIC_APP=""

# Parse arguments
SKIP_NEXT=false
args=("$@")
for i in "${!args[@]}"; do
    if [[ "$SKIP_NEXT" == true ]]; then
        SKIP_NEXT=false
        continue
    fi
    
    arg="${args[$i]}"
    next_i=$((i + 1))
    next_arg="${args[$next_i]}"
    
    case $arg in
        --push)
            PUSH_TO_HUB="yes"
            ;;
        --intel|--amd64)
            BUILD_PLATFORM="linux/amd64"
            ;;
        --arm64|--mac)
            BUILD_PLATFORM="linux/arm64"
            ;;
        --app)
            if [[ -n "$next_arg" && ! "$next_arg" =~ ^-- ]]; then
                SPECIFIC_APP="$next_arg"
                SKIP_NEXT=true
            else
                echo "Error: --app requires an app name (gateway, crawler, processor)"
                exit 1
            fi
            ;;
        --auto)
            AUTO_INCREMENT="yes"
            if [[ "$next_arg" =~ ^(patch|minor|major)$ ]]; then
                INCREMENT_TYPE="$next_arg"
                SKIP_NEXT=true
            fi
            ;;
        --help|-h)
            ;;
        v[0-9]*)
            # Version specified
            VERSION="$arg"
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Helper functions
print_header() {
    echo -e "\n${MAGENTA}════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${MAGENTA}════════════════════════════════════════════${NC}\n"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Show usage
show_usage() {
    cat << EOF
${BLUE}🚀 Pika Flow - Build Script${NC}

${YELLOW}Usage:${NC}
  ./pika-build.sh                     # Build all apps locally
  ./pika-build.sh --app crawler       # Build only crawler
  ./pika-build.sh --app gateway --push # Build and push only gateway
  ./pika-build.sh --intel             # Build for Intel/AMD64
  ./pika-build.sh --mac               # Build for Mac ARM64
  ./pika-build.sh --push              # Build + Push (auto-detect version)
  ./pika-build.sh --push v1.0.1       # Build + Push with specific version
  ./pika-build.sh --intel --push v1.0.1 # Build for Intel + Push
  ./pika-build.sh --push --auto patch # Build + Push (auto-increment patch)

${YELLOW}Examples:${NC}
  ./pika-build.sh                       # Build all apps (native)
  ./pika-build.sh --app crawler         # Build only crawler
  ./pika-build.sh --app processor --intel --push v1.0.1  # Build processor for Intel + Push
  ./pika-build.sh --push --auto patch   # Build all + auto-increment version

${YELLOW}App Selection:${NC}
  --app <name>     Build only specific app (gateway, crawler, processor)
  (default)        Build all apps

${YELLOW}Platform Options:${NC}
  (default)        Native platform (auto-detect)
  --intel          Build for Intel/AMD64 (VPS/Server)
  --amd64          Same as --intel
  --mac            Build for Mac ARM64
  --arm64          Same as --mac

${YELLOW}Push Options:${NC}
  (default)        Build Docker images locally
  --push           Build + Push to Docker Hub
  --auto patch     Auto-increment patch version (v1.0.0 → v1.0.1)
  --auto minor     Auto-increment minor version (v1.0.0 → v1.1.0)
  --auto major     Auto-increment major version (v1.0.0 → v2.0.0)
  --help           Show this help message

EOF
}

# Show help
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    show_usage
    exit 0
fi

# Function to get latest version from Docker Hub or Git
get_latest_version() {
    # Try to get from Docker Hub first
    if docker inspect "$DOCKER_HUB_USER/pika-gateway:latest" &>/dev/null 2>&1; then
        # Get latest tag from local images
        docker images "$DOCKER_HUB_USER/pika-gateway" --format "{{.Tag}}" | grep -E "^v[0-9]+\.[0-9]+\.[0-9]+$" | sort -V | tail -1 2>/dev/null || echo "v1.0.0"
    else
        # Try git tags
        if git describe --tags --abbrev=0 2>/dev/null | grep -E "^v[0-9]+\.[0-9]+\.[0-9]+$" > /dev/null 2>&1; then
            git describe --tags --abbrev=0 2>/dev/null
        else
            echo "v1.0.0"
        fi
    fi
}

# Function to increment version
increment_version() {
    local version=$1
    local type=$2
    
    # Remove 'v' prefix
    version=${version#v}
    
    # Split version into parts
    IFS='.' read -r major minor patch <<< "$version"
    
    case $type in
        patch)
            patch=$((patch + 1))
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        *)
            echo "Invalid increment type: $type" >&2
            exit 1
            ;;
    esac
    
    echo "v${major}.${minor}.${patch}"
}

# Determine mode and version
if [[ "$PUSH_TO_HUB" == "yes" ]]; then
    MODE="PUSH"
    
    # Check if auto-increment is requested
    if [[ "$AUTO_INCREMENT" == "yes" ]]; then
        # Auto-increment mode
        if [[ -z "$INCREMENT_TYPE" ]]; then
            INCREMENT_TYPE="patch"  # Default to patch
        fi
        current_version=$(get_latest_version)
        VERSION=$(increment_version "$current_version" "$INCREMENT_TYPE")
        echo -e "${MAGENTA}📦 Mode: BUILD + PUSH (Auto-Increment $INCREMENT_TYPE)${NC}"
        echo -e "${YELLOW}Current: $current_version → New: $VERSION${NC}"
    elif [[ -n "$VERSION" ]]; then
        # Manual version specified
        echo -e "${MAGENTA}📦 Mode: BUILD + PUSH TO DOCKER HUB (Manual Version)${NC}"
        echo -e "${YELLOW}Version: $VERSION${NC}"
    else
        # Auto-detect latest version
        VERSION=$(get_latest_version)
        echo -e "${MAGENTA}📦 Mode: BUILD + PUSH (Auto-Detected)${NC}"
        echo -e "${YELLOW}Version: $VERSION${NC}"
    fi
else
    MODE="LOCAL"
    echo -e "${MAGENTA}🔨 Mode: BUILD LOCALLY${NC}"
fi

# Determine build platform
if [[ -z "$BUILD_PLATFORM" ]]; then
    # Auto-detect native platform
    NATIVE_ARCH=$(uname -m)
    if [[ "$NATIVE_ARCH" == "arm64" ]]; then
        BUILD_PLATFORM="linux/arm64"
        PLATFORM_NAME="Mac ARM64 (Native)"
    else
        BUILD_PLATFORM="linux/amd64"
        PLATFORM_NAME="Intel/AMD64 (Native)"
    fi
else
    if [[ "$BUILD_PLATFORM" == "linux/amd64" ]]; then
        PLATFORM_NAME="Intel/AMD64"
    else
        PLATFORM_NAME="Mac ARM64"
    fi
fi

# Determine which services to build
if [[ -n "$SPECIFIC_APP" ]]; then
    # Validate the app name
    valid_app=false
    for svc in "${ALL_SERVICES[@]}"; do
        if [[ "$svc" == "$SPECIFIC_APP" ]]; then
            valid_app=true
            break
        fi
    done
    
    if [[ "$valid_app" == false ]]; then
        print_error "Invalid app name: $SPECIFIC_APP"
        echo "Valid apps: ${ALL_SERVICES[*]}"
        exit 1
    fi
    
    SERVICES=("$SPECIFIC_APP")
    echo -e "${YELLOW}📦 App: $SPECIFIC_APP (single app mode)${NC}"
else
    SERVICES=("${ALL_SERVICES[@]}")
    echo -e "${YELLOW}📦 Apps: ${SERVICES[*]} (all apps)${NC}"
fi

echo -e "${YELLOW}🏗️  Platform: $PLATFORM_NAME${NC}"

# Step 1: Check prerequisites
print_header "Step 1: Checking Prerequisites"

if ! command -v docker &> /dev/null; then
    print_error "Docker not installed"
    exit 1
fi
print_success "Docker is installed"

if ! command -v pnpm &> /dev/null; then
    print_error "pnpm not installed"
    exit 1
fi
print_success "pnpm is installed"

if ! docker info > /dev/null 2>&1; then
    print_error "Docker daemon not running"
    exit 1
fi
print_success "Docker daemon is running"

# Step 2: Validate version format (if push mode)
if [[ "$MODE" == "PUSH" ]]; then
    print_header "Step 2: Validating Version Format"
    if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "Invalid version format: $VERSION"
        echo "Expected format: v<MAJOR>.<MINOR>.<PATCH> (e.g., v1.0.0)"
        exit 1
    fi
    print_success "Version format is valid: $VERSION"
else
    print_header "Step 2: Skipping Version Validation (Local Mode)"
fi

# Step 3: Check Docker Hub login (if push mode)
if [[ "$MODE" == "PUSH" ]]; then
    print_header "Step 3: Checking Docker Hub Authentication"
    
    if ! docker ps > /dev/null 2>&1; then
        print_warning "Not authenticated with Docker Hub"
        print_step "Running docker login..."
        docker login
        print_success "Logged in to Docker Hub"
    else
        print_success "Already authenticated with Docker Hub"
    fi
else
    print_header "Step 3: Skipping Docker Hub Authentication (Local Mode)"
fi

# Step 4: Change to project directory
print_header "Step 4: Preparing Environment"
print_step "Project directory: $PROJECT_DIR"
cd "$PROJECT_DIR"
print_success "Changed to project directory"

# Step 5: Update dependencies
print_header "Step 5: Installing Dependencies"
print_step "Running: pnpm install"
pnpm install --frozen-lockfile
print_success "Dependencies installed"

# Step 6: Build NestJS applications
print_header "Step 6: Building NestJS Applications"
for service in "${SERVICES[@]}"; do
    print_step "Building $service..."
    pnpm exec nx build "$service" --prod
    print_success "$service built successfully"
done

# Step 7: Create Docker images
print_header "Step 7: Building Docker Images ($PLATFORM_NAME)"
for service in "${SERVICES[@]}"; do
    image_name="pika-${service}:latest"
    dockerfile_path="apps/${service}/Dockerfile"
    
    print_step "Building image: $image_name (Platform: $BUILD_PLATFORM)"
    docker build \
        --platform "$BUILD_PLATFORM" \
        -t "$image_name" \
        -f "$dockerfile_path" \
        .
    print_success "Image built: $image_name"
done

# Step 8: Tag and Push (if push mode)
if [[ "$MODE" == "PUSH" ]]; then
    print_header "Step 8: Tagging Images for Docker Hub"
    for service in "${SERVICES[@]}"; do
        local_image="pika-${service}:latest"
        hub_image_version="$DOCKER_HUB_USER/pika-${service}:$VERSION"
        hub_image_latest="$DOCKER_HUB_USER/pika-${service}:latest"
        
        print_step "Tagging: $local_image"
        docker tag "$local_image" "$hub_image_version"
        docker tag "$local_image" "$hub_image_latest"
        print_success "Tagged as:"
        echo -e "  ${GREEN}• $hub_image_version${NC}"
        echo -e "  ${GREEN}• $hub_image_latest${NC}"
    done

    print_header "Step 9: Pushing Images to Docker Hub"
    for service in "${SERVICES[@]}"; do
        hub_image_version="$DOCKER_HUB_USER/pika-${service}:$VERSION"
        hub_image_latest="$DOCKER_HUB_USER/pika-${service}:latest"
        
        print_step "Pushing: $hub_image_version"
        docker push "$hub_image_version"
        print_success "Pushed: $hub_image_version"
        
        print_step "Pushing: $hub_image_latest"
        docker push "$hub_image_latest"
        print_success "Pushed: $hub_image_latest"
    done
else
    print_header "Step 8-9: Skipping Push (Local Mode)"
fi

# Final summary
if [[ "$MODE" == "PUSH" ]]; then
    print_header "🎉 Build & Push Complete!"
    
    echo -e "${YELLOW}📊 Summary:${NC}\n"
    for service in "${SERVICES[@]}"; do
        echo -e "  ${GREEN}✓${NC} $DOCKER_HUB_USER/pika-$service:$VERSION"
        echo -e "  ${GREEN}✓${NC} $DOCKER_HUB_USER/pika-$service:latest"
    done
    
    echo -e "\n${YELLOW}🌐 View on Docker Hub:${NC}\n"
    for service in "${SERVICES[@]}"; do
        echo -e "  https://hub.docker.com/r/$DOCKER_HUB_USER/pika-$service"
    done
    
    echo -e "\n${YELLOW}📥 Pull images:${NC}\n"
    for service in "${SERVICES[@]}"; do
        echo -e "  docker pull $DOCKER_HUB_USER/pika-$service:$VERSION"
    done
    
    echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✨ Images are ready for production.${NC}\n"
else
    print_header "✨ Local Build Complete!"
    
    echo -e "${YELLOW}📊 Built Images:${NC}\n"
    docker images | grep pika- | while read line; do
        echo -e "  ${GREEN}$line${NC}"
    done
    
    echo -e "\n${YELLOW}🐳 Next steps:${NC}\n"
    echo -e "  1. Start services:"
    echo -e "     ${GREEN}docker compose up -d${NC}"
    echo -e ""
    echo -e "  2. Check status:"
    echo -e "     ${GREEN}docker compose ps${NC}"
    echo -e ""
    echo -e "  3. Test API:"
    echo -e "     ${GREEN}curl -H 'x-api-key: pika-gateway-secret-key-12345' http://localhost:3000/api/health${NC}"
    echo -e ""
    echo -e "  4. When ready to push:"
    echo -e "     ${GREEN}./pika-build.sh --push v1.0.1${NC}"
    
    echo -e "\n${GREEN}🚀 Images ready for local testing!${NC}\n"
fi
