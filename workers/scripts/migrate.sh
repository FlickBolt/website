#!/usr/bin/env bash
# Apply D1 migrations. Run from workers/api/.
# Usage:
#   ./scripts/migrate.sh local
#   ./scripts/migrate.sh remote
set -euo pipefail
target="${1:-local}"
cd "$(dirname "$0")/../api"
if [ "$target" = "remote" ]; then
  npx wrangler d1 migrations apply flickbolt_db --remote
else
  npx wrangler d1 migrations apply flickbolt_db --local
fi
