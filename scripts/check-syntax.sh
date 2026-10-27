#!/usr/bin/env bash
set -eu
count=0
for file in scripts/*.mjs tests/unit/*.mjs tests/site/*.mjs tests/e2e/*.mjs playwright.config.mjs; do
  node --check "$file"
  count=$((count + 1))
done
printf 'Syntax checked %s JavaScript modules.\n' "$count"
