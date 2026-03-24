#!/usr/bin/env bash
#
# Builds the Anchor program and the standalone Rust crates, then emits the IDL
# and TypeScript types consumed by the SDK package.

set -euo pipefail

readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly IDL_OUT="${ROOT_DIR}/packages/sdk/src/idl"

log() {
  printf '\033[0;32m[build]\033[0m %s\n' "$1"
}

main() {
  cd "${ROOT_DIR}"

  log "building workspace crates"
  cargo build --workspace --release

  log "running anchor build"
  anchor build

  log "syncing program id into source"
  anchor keys sync

  mkdir -p "${IDL_OUT}"
  log "copying generated idl into sdk"
  cp target/idl/neuralmint.json "${IDL_OUT}/neuralmint.json"
  cp target/types/neuralmint.ts "${IDL_OUT}/neuralmint.ts"

  log "build complete"
}

main "$@"
