# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Anchor program with `initialize`, `wrap` and `unwrap` instructions.
- `nmint-core` crate: PDA derivation, vault ledger and checked math.
- `@neuralmint/sdk`: PDA helpers, instruction builders and `NeuralMintClient`.
- Next.js 15 application shell with multi-wallet adapter and GSAP/Lenis motion.
- AI prompt enhancer and generation hook.
- GitHub Actions workflows for Anchor, lint/types and security scanning.
- Architecture, token-bound NFT and SDK reference documentation.

### Changed

- Authority PDA reconstructed from the persisted bump on the hot path to avoid
  on-chain `find_program_address` searches.
- Account validation constants consolidated in the program.

### Security

- Added cargo-audit, yarn audit and CodeQL scanning to CI.

[Unreleased]: https://github.com/NeuralMintdev/neuralmint/commits/main
