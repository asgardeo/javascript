#!/usr/bin/env bash
# Usage: ./e2e/scripts/run-e2e.sh [--app react|angular|all] [--idp is|thunder|all] [--mode redirect|embedded|all] [--headed]
#
# Defaults: --app all --idp all --mode all

set -euo pipefail

APP="all"
IDP="all"
MODE="all"
EXTRA_ARGS=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --app) APP="$2"; shift 2 ;;
    --idp) IDP="$2"; shift 2 ;;
    --mode) MODE="$2"; shift 2 ;;
    --headed) EXTRA_ARGS="--headed"; shift ;;
    *) EXTRA_ARGS="$EXTRA_ARGS $1"; shift ;;
  esac
done

run_suite() {
  local app=$1
  local idp=$2
  local mode=$3
  local test_dir="e2e/tests/${app}/${idp}/${mode}"

  # Skip combinations that don't have tests yet
  if [[ ! -d "$test_dir" ]]; then
    echo ""
    echo "=== Skipping e2e: APP=$app IDP=$idp MODE=$mode (no tests at $test_dir) ==="
    return 0
  fi

  echo ""
  echo "=== Running e2e: APP=$app IDP=$idp MODE=$mode ==="
  echo ""
  SAMPLE_APP_TARGET="$app" IDP_TARGET="$idp" npx playwright test --config "e2e/playwright.${mode}.config.ts" $EXTRA_ARGS
}

# Expand APP dimension
if [[ "$APP" == "all" ]]; then
  apps=(react angular)
else
  apps=("$APP")
fi

# Expand IDP dimension
if [[ "$IDP" == "all" ]]; then
  idps=(is thunder)
else
  idps=("$IDP")
fi

# Expand MODE dimension
if [[ "$MODE" == "all" ]]; then
  modes=(redirect embedded)
else
  modes=("$MODE")
fi

for app in "${apps[@]}"; do
  for idp in "${idps[@]}"; do
    for mode in "${modes[@]}"; do
      run_suite "$app" "$idp" "$mode"
    done
  done
done
