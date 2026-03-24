#!/usr/bin/env bash
#
# Bootstraps a local development environment for NeuralMint: verifies the
# Solana and Anchor toolchains, installs JavaScript dependencies and generates
# a throwaway keypair for localnet testing.

set -euo pipefail

readonly REQUIRED_SOLANA="1.18.17"
readonly REQUIRED_ANCHOR="0.30.1"
readonly KEYPAIR_PATH="${HOME}/.config/solana/id.json"

log() {
  printf '\033[0;36m[setup]\033[0m %s\n' "$1"
}

fail() {
  printf '\033[0;31m[setup:error]\033[0m %s\n' "$1" >&2
  exit 1
}

require_bin() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required binary: $1"
}

main() {
  require_bin solana
  require_bin anchor
  require_bin yarn

  local solana_version anchor_version
  solana_version="$(solana --version | awk '{print $2}')"
  anchor_version="$(anchor --version | awk '{print $2}')"

  log "detected solana ${solana_version} (expected ${REQUIRED_SOLANA})"
  log "detected anchor ${anchor_version} (expected ${REQUIRED_ANCHOR})"

  if [[ ! -f "${KEYPAIR_PATH}" ]]; then
    log "generating localnet keypair at ${KEYPAIR_PATH}"
    solana-keygen new --no-bip39-passphrase --silent --outfile "${KEYPAIR_PATH}"
  fi

  log "configuring solana cli for localnet"
  solana config set --url localhost >/dev/null

  log "installing javascript dependencies"
  yarn install --frozen-lockfile

  log "environment ready"
}

main "$@"
