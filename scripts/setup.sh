#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo ""
echo "╔══════════════════════════════════╗"
echo "║   Guia Flui — Setup Automático   ║"
echo "╚══════════════════════════════════╝"
echo ""

# asdf: instala e ativa versão do .tool-versions
if command -v asdf >/dev/null 2>&1 && [[ -f .tool-versions ]]; then
  NODE_VERSION="$(awk '/^nodejs / {print $2}' .tool-versions)"
  if [[ -n "$NODE_VERSION" ]]; then
    if ! asdf where nodejs "$NODE_VERSION" >/dev/null 2>&1; then
      echo "→ Instalando Node.js $NODE_VERSION via asdf..."
      asdf install nodejs "$NODE_VERSION"
    fi
    asdf set nodejs "$NODE_VERSION"
    echo "→ Node.js $(node -v) (asdf)"
  fi
fi

# nvm: usa .nvmrc se disponível
if [[ -f .nvmrc ]] && [[ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
  # shellcheck disable=SC1091
  source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  echo "→ Ativando Node via nvm (.nvmrc)..."
  nvm install
  nvm use
  echo "→ Node.js $(node -v) (nvm)"
fi

node scripts/setup.js
