# SDK API Reference

`@neuralmint/sdk` is the typed client for the NeuralMint program. It exposes PDA
derivation, instruction builders and a high-level client.

## Installation

```bash
yarn add @neuralmint/sdk @solana/web3.js @solana/spl-token
```

## PDA Derivation

### `deriveVaultAddresses(nftMint, programId?)`

Returns the full address set for a vault.

```typescript
import { deriveVaultAddresses } from '@neuralmint/sdk';

const { authority, authorityBump, state, stateBump } = deriveVaultAddresses(nftMint);
```

| Field | Type | Description |
|-------|------|-------------|
| `authority` | `PublicKey` | Program-owned signer that custodies tokens |
| `authorityBump` | `number` | Canonical bump for the authority PDA |
| `state` | `PublicKey` | Vault state account |
| `stateBump` | `number` | Canonical bump for the state PDA |

### `deriveVaultAuthority(nftMint, programId?)` / `deriveVaultState(nftMint, programId?)`

Lower-level helpers returning a `[PublicKey, number]` tuple.

## Instruction Builders

Each builder returns a `TransactionInstruction` and never touches the network.

### `buildInitializeInstruction(params, programId?)`

```typescript
import { buildInitializeInstruction } from '@neuralmint/sdk';

const ix = buildInitializeInstruction({ nftMint, tokenMint, owner });
```

### `buildWrapInstruction(params, depositorTokenAccount, programId?)`

Locks `LOCKED_AMOUNT` base units from `depositorTokenAccount` into the vault.

### `buildUnwrapInstruction(params, nftHolderAccount, holderTokenAccount, programId?)`

Releases the locked balance to `holderTokenAccount`, gated by `nftHolderAccount`.

## Client

### `new NeuralMintClient(options)`

```typescript
import { Connection } from '@solana/web3.js';
import { NeuralMintClient } from '@neuralmint/sdk';

const client = new NeuralMintClient({
  connection: new Connection('https://api.devnet.solana.com'),
  commitment: 'confirmed',
});
```

| Method | Returns | Description |
|--------|---------|-------------|
| `initializeVaultTx(params)` | `Transaction` | Builds the initialize transaction |
| `wrapTx(params)` | `Promise<Transaction>` | Builds the wrap transaction |
| `unwrapTx(params)` | `Promise<Transaction>` | Builds the unwrap transaction |
| `fetchVault(nftMint)` | `Promise<VaultAccount>` | Decodes on-chain vault state |

## Errors

All SDK errors extend `NeuralMintError` and carry a stable `code`:

| Class | Code | Raised when |
|-------|------|-------------|
| `VaultNotFoundError` | `VAULT_NOT_FOUND` | No vault exists for the NFT mint |
| `UnauthorizedHolderError` | `UNAUTHORIZED_HOLDER` | Signer does not hold the NFT |
| `AccountDecodeError` | `ACCOUNT_DECODE_FAILED` | Account data is malformed |

See [examples/](../examples/) for complete flows.
