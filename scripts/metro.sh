#!/usr/bin/env bash
# Mantém o Metro vivo em 127.0.0.1:8083.
# Reinicia sozinho se o processo cair (sessão, OOM, crash de rede).
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${HOME}/.local/rubies/3.3.8/bin:/opt/homebrew/bin:/usr/local/bin:${PATH}"
export REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1
export EXPO_NO_TELEMETRY=1

PORT=8083
STATUS_URL="http://127.0.0.1:${PORT}/status"

healthy() {
  curl -sf --max-time 2 "$STATUS_URL" 2>/dev/null | grep -q 'packager-status:running'
}

free_port() {
  local pids
  pids="$(lsof -nP -tiTCP:${PORT} -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    echo "Encerrando processo antigo na porta ${PORT}: ${pids}"
    kill ${pids} 2>/dev/null || true
    sleep 1
    pids="$(lsof -nP -tiTCP:${PORT} -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "${pids}" ]]; then
      kill -9 ${pids} 2>/dev/null || true
    fi
  fi
}

echo "Metro keep-alive em ${STATUS_URL}"
echo "Log: ${ROOT}/.metro.log"
echo "Pare com Ctrl+C neste terminal, ou: lsof -tiTCP:${PORT} | xargs kill"

if healthy; then
  echo "Metro já está no ar. Vou vigiar e reiniciar se cair."
fi

while true; do
  if ! healthy; then
    free_port
    echo "[$(date '+%H:%M:%S')] iniciando Metro..."
    npm start || true
    echo "[$(date '+%H:%M:%S')] Metro saiu. Reiniciando em 2s..."
  fi
  sleep 2
done
