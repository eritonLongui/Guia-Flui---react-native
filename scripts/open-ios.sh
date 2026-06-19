#!/usr/bin/env bash
set -euo pipefail

# Abre o Simulator e lança o app (sem AppleScript — evita erro de permissão do macOS).
# O Metro deve estar rodando em 127.0.0.1:8083 (npm start).

DEVICE="${IOS_SIMULATOR_DEVICE:-iPhone 16}"
BUNDLE_ID="com.rota.app"

open -a Simulator
sleep 2

xcrun simctl boot "$DEVICE" 2>/dev/null || true
xcrun simctl bootstatus booted -b 2>/dev/null || sleep 2

xcrun simctl launch booted "$BUNDLE_ID" 2>/dev/null || \
  xcrun simctl launch "$DEVICE" "$BUNDLE_ID"

echo ""
echo "App ${APP_NAME:-Guia Flui} aberto no simulador ($DEVICE)."
echo "Metro deve estar rodando: npm start  (127.0.0.1:8083)"
