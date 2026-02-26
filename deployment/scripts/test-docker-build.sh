#!/bin/bash
# Test Docker builds locally before deploying to Railway
# Usage: ./test-docker-build.sh [api|web|migrate]

set -e

SERVICE=$1

if [ -z "$SERVICE" ]; then
  echo "Usage: ./test-docker-build.sh [api|web|migrate]"
  echo ""
  echo "Examples:"
  echo "  ./test-docker-build.sh api      # Test API build"
  echo "  ./test-docker-build.sh web      # Test Web build"
  echo "  ./test-docker-build.sh migrate  # Test migration build"
  exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/../.."
PROJECT_ROOT=$(pwd)

echo "Project root: $PROJECT_ROOT"

case $SERVICE in
  api)
    echo "Building API Docker image..."
    cd "$PROJECT_ROOT/apps/api"
    docker build -t horo-api:test -f Dockerfile "$PROJECT_ROOT"
    echo ""
    echo "✅ API build successful!"
    echo "To run: docker run -p 3000:3000 --env-file .env.local horo-api:test"
    ;;

  web)
    echo "Building Web Docker image..."
    cd "$PROJECT_ROOT/apps/web"
    docker build -t horo-web:test -f Dockerfile "$PROJECT_ROOT"
    echo ""
    echo "✅ Web build successful!"
    echo "To run: docker run -p 3000:3000 --env-file .env.local horo-web:test"
    ;;

  migrate)
    echo "Building Migration Docker image..."
    cd "$PROJECT_ROOT/deployment"
    docker build -t horo-migrate:test -f Dockerfile.migrate "$PROJECT_ROOT"
    echo ""
    echo "✅ Migration build successful!"
    echo "To run: docker run --env DATABASE_URL=<your-db-url> horo-migrate:test"
    ;;

  *)
    echo "Error: Unknown service '$SERVICE'"
    echo "Valid options: api, web, migrate"
    exit 1
    ;;
esac
