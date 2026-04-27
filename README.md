# NeuralMint

AI-generated NFT minting on Solana with a Token-2022 **token-bound NFT**
primitive. Each NFT custodies a deterministic, program-controlled vault holding
1,000,000 $NMINT. The vault authority is derived solely from the NFT mint, so
trading the NFT trades the unwrap rights.

[![Anchor](https://github.com/NeuralMintdev/neuralmint/actions/workflows/anchor.yml/badge.svg)](https://github.com/NeuralMintdev/neuralmint/actions/workflows/anchor.yml)
[![CI](https://github.com/NeuralMintdev/neuralmint/actions/workflows/ci.yml/badge.svg)](https://github.com/NeuralMintdev/neuralmint/actions/workflows/ci.yml)
[![Security](https://github.com/NeuralMintdev/neuralmint/actions/workflows/security.yml/badge.svg)](https://github.com/NeuralMintdev/neuralmint/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Overview

NeuralMint binds a fungible balance to a non-fungible token without storing an
owner. A single PDA derived from the NFT mint owns a vault; the program is its
only signer. Possession of the NFT is equivalent to control of the vault.

- **One PDA derivation** — vault authority derived deterministically from the
  NFT mint pubkey.
- **Permissionless** — no admin keys; the program is the sole signer.
- **Portable** — trade the NFT on any marketplace, the vault stays intact.
- **Token-2022 native** — compatible with SPL and Token-2022 mints.
- **Zero wrap fees** — wrap/unwrap operate at no protocol cost.

## Repository Layout

```
neuralmint/
├── programs/neuralmint/   Anchor program (initialize, wrap, unwrap)
├── crates/nmint-core/     Runtime-agnostic PDA + vault math (Rust)
├── packages/sdk/          TypeScript SDK (@neuralmint/sdk)
├── app/                   Next.js 15 front end (GSAP, Lenis, wallet adapter)
├── tests/                 Anchor integration tests
├── scripts/               Setup, build and validator shell tooling
├── docs/                  Architecture and API reference
└── examples/              End-to-end SDK flows
```

## Architecture

```
NFT Mint Address (on-chain)
    | PDA derivation
    v
Vault Authority (program-controlled, no private key)
    | controls
    v
Token Vault (1,000,000 $NMINT locked)
    | unwrap instruction (gated by NFT ownership)
    v
NFT Holder receives tokens
```

The two derivations that matter:

```
vault_authority = find_program_address(["vault-authority", nft_mint], program_id)
vault_state     = find_program_address(["vault-state",     nft_mint], program_id)
```

See [docs/architecture.md](./docs/architecture.md) and
[docs/token-bound-nft.md](./docs/token-bound-nft.md) for the full design.

## Quick Start

### Prerequisites

- Rust toolchain (stable)
- Solana CLI 1.18.17
- Anchor 0.30.1
- Node.js >= 20 and Yarn

### Setup

```bash
git clone https://github.com/NeuralMintdev/neuralmint.git
cd neuralmint
./scripts/setup.sh
```

### Build and Test

```bash
./scripts/build.sh        # build crates + program, sync IDL into the SDK
anchor test               # run the integration suite
cargo test -p nmint-core  # run the core unit tests
```

## SDK Usage

```typescript
import { Connection } from '@solana/web3.js';
import { NeuralMintClient } from '@neuralmint/sdk';

const client = new NeuralMintClient({
  connection: new Connection('https://api.devnet.solana.com'),
});

// Initialize and fund a vault behind an NFT mint
const params = { nftMint, tokenMint, owner: wallet.publicKey };
await wallet.sendTransaction(client.initializeVaultTx(params), connection);
await wallet.sendTransaction(await client.wrapTx(params), connection);

// Inspect the vault
const vault = await client.fetchVault(nftMint);
console.log(vault.lockedAmount.toString());
```

Full API in [docs/api-reference.md](./docs/api-reference.md); runnable flows in
[examples/](./examples/).

## Program Instructions

| Instruction | Signer | Description |
|-------------|--------|-------------|
| `initialize` | payer | Creates the vault state and program-owned token account |
| `wrap` | depositor | Locks 1,000,000 $NMINT into the vault |
| `unwrap` | NFT holder | Releases the balance, gated by NFT ownership |

## Technical Stack

- **Blockchain**: Solana, Token-2022, Metaplex
- **Program**: Rust, Anchor 0.30
- **SDK**: TypeScript, @solana/web3.js, @solana/spl-token
- **Front end**: Next.js 15, React 19, GSAP, Lenis, wallet-adapter
- **Marketplaces**: Magic Eden, Tensor compatible

## Security

The vault authority has no external private key; funds move only through `wrap`
and `unwrap`, and `unwrap` requires proof of NFT ownership. Report
vulnerabilities via GitHub Security Advisories — see [SECURITY.md](./SECURITY.md).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the
workflow, commit convention and quality gates.

## License

Released under the MIT License. See [LICENSE](./LICENSE).
