#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# build-sandbox.sh
# Builds the CIC sandbox Docker image and verifies every language runtime.
#
# Usage:
#   chmod +x build-sandbox.sh
#   ./build-sandbox.sh [--no-cache]
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

IMAGE="cic-sandbox:latest"
DOCKERFILE="Dockerfile.sandbox"
BUILD_FLAGS="${1:-}"

echo "═══════════════════════════════════════════════════════"
echo "  CIC Sandbox Builder"
echo "═══════════════════════════════════════════════════════"

# ── 1. Build ──────────────────────────────────────────────────────────────────
echo ""
echo "▶  Building image: ${IMAGE}"
docker build \
  ${BUILD_FLAGS} \
  -f "${DOCKERFILE}" \
  -t "${IMAGE}" \
  .

echo ""
echo "✅  Build complete"

# ── 2. Runtime verification ───────────────────────────────────────────────────
echo ""
echo "▶  Verifying language runtimes..."

run_check() {
  local label="$1"; shift
  local output
  output=$(docker run --rm --network none "${IMAGE}" "$@" 2>&1) && \
    echo "  ✅  ${label}: ${output}" || \
    echo "  ❌  ${label}: FAILED"
}

run_check "Python"     python3 --version
run_check "Node.js"    node    --version
run_check "Java"       sh -c "java -version 2>&1 | head -1"
run_check "GCC"        sh -c "gcc --version | head -1"
run_check "R"          sh -c "Rscript --version 2>&1 | head -1"

# ── 3. Security check ─────────────────────────────────────────────────────────
echo ""
echo "▶  Checking sandbox user..."
WHOAMI=$(docker run --rm --network none "${IMAGE}" sh -c "whoami && id")
echo "  ${WHOAMI}"
if echo "${WHOAMI}" | grep -q "root"; then
  echo "  ❌  WARNING: container is running as root – check Dockerfile"
  exit 1
fi
echo "  ✅  Non-root user confirmed"

# ── 4. Network isolation check ────────────────────────────────────────────────
echo ""
echo "▶  Checking network isolation..."
if docker run --rm --network none "${IMAGE}" \
    sh -c "wget -q --timeout=2 http://google.com -O /dev/null 2>&1"; then
  echo "  ❌  WARNING: network isolation NOT working"
  exit 1
else
  echo "  ✅  Network isolated (expected failure to reach internet)"
fi

# ── 5. Create host temp dir ───────────────────────────────────────────────────
echo ""
echo "▶  Ensuring host temp dir exists..."
mkdir -p /tmp/cic_compiler
echo "  ✅  /tmp/cic_compiler ready"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Sandbox ready!  Image: ${IMAGE}"
echo ""
echo "  Next steps:"
echo "    cp .env.example .env"
echo "    docker-compose up -d"
echo "═══════════════════════════════════════════════════════"