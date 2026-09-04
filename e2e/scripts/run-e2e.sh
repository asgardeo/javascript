#!/usr/bin/env bash
# Usage: ./e2e/scripts/run-e2e.sh [--idp is] [--mode redirect|embedded|all] [--headed]
#
# Defaults: --idp is --mode redirect

set -euo pipefail

IDP="is"
MODE="redirect"
EXTRA_ARGS=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --idp) IDP="$2"; shift 2 ;;
    --mode) MODE="$2"; shift 2 ;;
    --headed) EXTRA_ARGS="--headed"; shift ;;
    *) EXTRA_ARGS="$EXTRA_ARGS $1"; shift ;;
  esac
done

run_suite() {
  local idp=$1
  local mode=$2
  echo ""
  echo "=== Running e2e: IDP=$idp MODE=$mode ==="
  echo ""
  IDP_TARGET="$idp" npx playwright test --config "e2e/playwright.${mode}.config.ts" $EXTRA_ARGS
}

if [[ "$IDP" == "all" ]]; then
  IDP="is"
fi

if [[ "$MODE" == "all" ]]; then
  for mode in redirect embedded; do
    run_suite "$IDP" "$mode"
  done
else
  run_suite "$IDP" "$MODE"
fi
