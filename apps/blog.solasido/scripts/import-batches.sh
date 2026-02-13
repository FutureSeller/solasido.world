#!/bin/bash

BATCH_DIR="sql-batches-compressed"
SUCCESS=0
FAILED=0

echo "🚀 Starting batch import (gzip compressed)..."
echo ""

for file in "$BATCH_DIR"/batch-*.sql; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "📦 Importing $filename..."

    if pnpm wrangler d1 execute blog-db --local --file="$file" > /dev/null 2>&1; then
      echo "  ✅ Success"
      ((SUCCESS++))
    else
      echo "  ❌ Failed"
      ((FAILED++))
    fi
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Success: $SUCCESS"
echo "❌ Failed: $FAILED"
echo "📊 Total: $((SUCCESS + FAILED))"
