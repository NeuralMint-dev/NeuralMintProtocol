# Architecture

NeuralMint binds a fungible token balance to a non-fungible token through a
single, deterministically derived program authority. This document describes the
on-chain and off-chain components and the data flow between them.

## System Overview

```
            ┌──────────────────────────────────────────┐
            │                Next.js app                │
            │  wallet adapter · GSAP/Lenis · SDK calls  │
            └───────────────────┬──────────────────────┘
                                │ @neuralmint/sdk
                                ▼
            ┌──────────────────────────────────────────┐
            │            Instruction builders           │
            │   initialize · wrap · unwrap (Token-2022) │
            └───────────────────┬──────────────────────┘
                                │ Transaction
                                ▼
            ┌──────────────────────────────────────────┐
            │            neuralmint program             │
            │  PDA: vault-authority · vault-state       │
            └───────────────────┬──────────────────────┘
                                │ CPI (transfer_checked)
                                ▼
            ┌──────────────────────────────────────────┐
            │           Token-2022 program              │
            └──────────────────────────────────────────┘
```

## Component Layers

### On-chain program (`programs/neuralmint`)

A minimal Anchor program exposing three instructions. State is intentionally
small: one `Vault` account per NFT mint, plus a program-owned associated token
account that custodies the locked balance.

| Instruction | Authority | Effect |
|-------------|-----------|--------|
| `initialize` | payer | Creates the vault state and vault ATA |
| `wrap` | depositor | Locks the canonical amount into the vault |
| `unwrap` | NFT holder | Releases the balance, gated by NFT ownership |

### Shared core (`crates/nmint-core`)

Runtime-agnostic Rust crate that owns the seed scheme, PDA derivation and the
checked vault ledger. It compiles without the Anchor runtime so the same logic
backs the program, the test harness and any off-chain indexer.

### TypeScript SDK (`packages/sdk`)

Mirrors the seed scheme and instruction layout, exposes typed PDA helpers,
instruction builders and a `NeuralMintClient` that assembles and decodes
transactions.

### Application (`app`)

Next.js 15 front end. Handles wallet connection, prompt-driven AI generation and
the mint/wrap/unwrap user flows, with motion handled by GSAP and Lenis.

## PDA Scheme

Two addresses are derived solely from the NFT mint pubkey:

```
vault_authority = find_program_address(["vault-authority", nft_mint], program_id)
vault_state     = find_program_address(["vault-state",     nft_mint], program_id)
```

Because both depend only on the NFT mint, vault access is fully portable: there
is no owner field to migrate and no admin key to rotate. Trading the NFT trades
the unwrap rights.

## Trust Model

- The vault authority is a PDA. No private key exists for it; the program signs
  transfers via `invoke_signed` using the stored bump.
- `unwrap` requires the caller to present a token account holding exactly one
  unit of the gating NFT, owned by the signer.
- There are no admin instructions. The program cannot move funds outside the
  `wrap` / `unwrap` flows.

## Compute Considerations

The hot path avoids `find_program_address` by persisting the authority bump on
the vault state and reconstructing the signer with `create_program_address`. See
[`nmint-core::pda`](../crates/nmint-core/src/pda.rs) for the derivation helpers.
