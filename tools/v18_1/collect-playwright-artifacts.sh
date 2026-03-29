#!/usr/bin/env bash
set -euo pipefail
ts=$(date +%Y%m%d-%H%M%S)
mkdir -p artifacts/playwright artifacts/issues
echo "Collecting Playwright artifacts into artifacts/playwright/$ts"
