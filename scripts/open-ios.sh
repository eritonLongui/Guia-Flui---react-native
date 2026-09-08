#!/usr/bin/env bash
set -euo pipefail

# Abre o Simulator e lança o app (sem AppleScript — evita erro de permissão do macOS).
# O Metro deve estar rodando em 127.0.0.1:8083 (npm run metro).

DEVICE="${IOS_SIMULATOR_DEVICE:-iPhone 17}"
BUNDLE_ID="com.rota.app"

if ! curl -sf --max-time 2 http://127.0.0.1:8083/status | grep -q 'packager-status:running'; then
  echo "Metro não está no ar em 127.0.0.1:8083."
  echo "Em outro Terminal: npm run metro"
  exit 1
fi

open -a Simulator
sleep 2

xcrun simctl boot "$DEVICE" 2>/dev/null || true
xcrun simctl bootstatus booted -b 2>/dev/null || sleep 2

xcrun simctl launch booted "$BUNDLE_ID" 2>/dev/null || \
  xcrun simctl launch "$DEVICE" "$BUNDLE_ID"

echo ""
echo "App ${APP_NAME:-Guia Flui} aberto no simulador ($DEVICE)."
echo "Metro deve estar rodando: npm run metro  (127.0.0.1:8083)"
