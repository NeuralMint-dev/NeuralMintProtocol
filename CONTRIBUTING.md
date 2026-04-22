# Contributing to NeuralMint

Thank you for considering a contribution. This document describes the workflow
and expectations for changes to the program, core crate, SDK and app.

## Development Setup

```bash
git clone https://github.com/NeuralMintdev/neuralmint.git
cd neuralmint
./scripts/setup.sh
```

The setup script verifies the Solana and Anchor toolchains, installs JavaScript
dependencies and generates a localnet keypair.

## Branching

Create a topic branch from `main`:

- `feat/` for new features
- `fix/` for bug fixes
- `refactor/`, `perf/`, `docs/`, `test/`, `chore/` for the obvious

## Commit Convention

This repository follows Conventional Commits. Scope by component where it helps:

```
feat(program): add close_vault instruction
fix(sdk): correct unwrap account ordering
perf(core): reconstruct authority PDA from stored bump
```

## Quality Gates

Before opening a pull request:

```bash
cargo fmt --all
cargo clippy --workspace --all-targets -- -D warnings
cargo test -p nmint-core
anchor test
yarn lint && yarn format:check
```

All CI workflows (Anchor, CI, Security) must pass.

## Program Changes

Changes to `programs/neuralmint` require:

- A corresponding update to the SDK instruction builders when the account layout
  or instruction surface changes.
- Integration tests under `tests/` covering the new behavior.
- A note in `CHANGELOG.md` under the Unreleased section.

Account layout changes are breaking; flag them explicitly in the PR description.

## Pull Requests

- Keep PRs focused and reasonably small.
- Fill out the PR template, including the testing checklist.
- Link any related issues.

## Code of Conduct

Be respectful and constructive. Technical disagreement is welcome; personal
attacks are not.
