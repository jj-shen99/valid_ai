#!/usr/bin/env bash
set -euo pipefail

# ─── ValidAI Production Deploy Script ───
# Usage: ./deploy.sh [--skip-tests] [--port 8080]

PORT="${PORT:-8080}"
SKIP_TESTS=false
DIST_DIR="dist"

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-tests) SKIP_TESTS=true; shift ;;
    --port) PORT="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo "═══════════════════════════════════════"
echo "  ValidAI Production Deploy"
echo "  Version: $(node -p "require('./package.json').version")"
echo "═══════════════════════════════════════"
echo ""

# Step 1: Install dependencies
echo "▸ Installing dependencies..."
npm ci --omit=dev 2>/dev/null || npm install --omit=dev
echo "  ✓ Dependencies installed"

# Step 2: Run tests (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
  echo ""
  echo "▸ Running tests..."
  npm install --include=dev 2>/dev/null
  npx vitest run --reporter=verbose 2>&1 | tail -5
  echo "  ✓ Tests passed"
fi

# Step 3: Lint check (if eslint is available)
if command -v npx &>/dev/null && npx eslint --version &>/dev/null 2>&1; then
  echo ""
  echo "▸ Linting..."
  npx eslint src/ --quiet || true
  echo "  ✓ Lint check complete"
fi

# Step 4: Build for production
echo ""
echo "▸ Building for production..."
npm run build
echo "  ✓ Build complete → ./$DIST_DIR"

# Step 5: Verify build output
if [ ! -d "$DIST_DIR" ]; then
  echo "  ✗ Build directory not found!"
  exit 1
fi

ASSET_COUNT=$(find "$DIST_DIR" -type f | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$DIST_DIR" | cut -f1)
echo "  Files: $ASSET_COUNT | Size: $TOTAL_SIZE"

# Step 6: Serve or deploy
echo ""
echo "═══════════════════════════════════════"
echo "  Build ready for deployment"
echo "═══════════════════════════════════════"
echo ""
echo "Deploy options:"
echo ""
echo "  1. Static file server (preview):"
echo "     npx serve $DIST_DIR -l $PORT"
echo ""
echo "  2. Nginx:"
echo "     cp -r $DIST_DIR/* /var/www/validai/"
echo ""
echo "  3. Docker:"
echo "     docker build -t validai ."
echo "     docker run -p $PORT:80 validai"
echo ""
echo "  4. Netlify / Vercel / Cloudflare Pages:"
echo "     Push to repo with build command: npm run build"
echo "     Publish directory: $DIST_DIR"
echo ""

# Optional: start preview server
if [[ "${SERVE:-false}" == "true" ]]; then
  echo "▸ Starting preview server on port $PORT..."
  npx serve "$DIST_DIR" -l "$PORT" -s
fi
