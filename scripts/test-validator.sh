#!/usr/bin/env bash
#
# Spins up a local solana-test-validator preloaded with the Token-2022 program
# and the compiled NeuralMint program, then waits for it to become healthy.

set -euo pipefail

readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly LEDGER_DIR="${ROOT_DIR}/.anchor/test-ledger"
readonly PROGRAM_ID="NMNTkVyB8z9pXq3rJ7wMfZ2cH6tD4sL1aR5nE8gU0Wv"
readonly PROGRAM_SO="${ROOT_DIR}/target/deploy/neuralmint.so"
readonly RPC_URL="http://127.0.0.1:8899"

log() {
  printf '\033[0;33m[validator]\033[0m %s\n' "$1"
}

cleanup() {
  if [[ -n "${VALIDATOR_PID:-}" ]]; then
    log "stopping validator (pid ${VALIDATOR_PID})"
    kill "${VALIDATOR_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

main() {
  [[ -f "${PROGRAM_SO}" ]] || {
    printf 'program artifact not found, run scripts/build.sh first\n' >&2
    exit 1
  }

  rm -rf "${LEDGER_DIR}"

  log "starting validator with Token-2022 cloned from mainnet"
  solana-test-validator \
    --ledger "${LEDGER_DIR}" \
    --bpf-program "${PROGRAM_ID}" "${PROGRAM_SO}" \
    --clone TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
    --url https://api.mainnet-beta.solana.com \
    --reset \
    --quiet &
  VALIDATOR_PID=$!

  log "waiting for rpc at ${RPC_URL}"
  for _ in $(seq 1 30); do
    if solana cluster-version --url "${RPC_URL}" >/dev/null 2>&1; then
      log "validator healthy"
      wait "${VALIDATOR_PID}"
      return 0
    fi
    sleep 1
  done

  printf 'validator did not become healthy in time\n' >&2
  exit 1
}

main "$@"
