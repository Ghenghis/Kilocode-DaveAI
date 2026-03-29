#!/usr/bin/env bash
set -euo pipefail
ts=$(date +%Y%m%d-%H%M%S)
mkdir -p artifacts/build artifacts/issues
echo "Collecting build artifacts into artifacts/build/$ts"
