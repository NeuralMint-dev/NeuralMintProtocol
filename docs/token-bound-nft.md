# The Token-Bound NFT Primitive

NeuralMint treats an NFT as a bearer instrument for a fungible balance. This
note explains the mechanism, its invariants and the lifecycle of a vault.

## Motivation

Conventional "redeemable" NFTs track the redeemer in a mutable owner field,
which couples redemption rights to an account that must be kept in sync as the
NFT changes hands. NeuralMint removes that field entirely: the only thing that
determines who can withdraw is who holds the NFT at call time.

## Binding Construction

For a given NFT mint `M`:

```
authority(M) = PDA(["vault-authority", M])
state(M)     = PDA(["vault-state", M])
vault_ata(M) = ATA(token_mint, authority(M))   // Token-2022
```

`vault_ata(M)` custodies exactly `LOCKED_AMOUNT` base units once funded. The
program is the sole signer of `authority(M)`.

## Lifecycle

```
        initialize            wrap                 unwrap
   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
   │ state created  │──▶│ balance locked │──▶│ balance to     │
   │ ledger = Empty │   │ ledger = Funded│   │ holder, Empty  │
   └────────────────┘   └────────────────┘   └────────────────┘
            ▲                                          │
            └──────────────── re-wrap ─────────────────┘
```

A vault may be re-wrapped after an unwrap; the state account persists across the
cycle and only the ledger flag and balance change.

## Invariants

1. `vault_state.locked_amount` equals the vault ATA balance at rest.
2. `wrap` is rejected when the vault is already funded.
3. `unwrap` is rejected unless the signer proves ownership of one NFT unit.
4. `authority(M)` has no external signer; only `invoke_signed` can move funds.

These invariants are exercised both by the off-chain ledger model in
`nmint-core` and by the Anchor integration tests under `tests/`.

## Portability

Because nothing in the vault references an owner, the NFT can be listed and sold
on Magic Eden or Tensor with no additional bookkeeping. The buyer inherits the
unwrap rights the moment the NFT settles into their wallet.
