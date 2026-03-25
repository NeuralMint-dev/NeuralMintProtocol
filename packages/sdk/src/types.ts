import type { PublicKey } from '@solana/web3.js';

/**
 * On-chain program identifier for the deployed NeuralMint program.
 */
export const NEURALMINT_PROGRAM_ID = 'NMNTkVyB8z9pXq3rJ7wMfZ2cH6tD4sL1aR5nE8gU0Wv';

/**
 * Canonical amount, in base units, locked behind every NFT (1,000,000 tokens
 * at 6 decimals).
 */
export const LOCKED_AMOUNT = 1_000_000_000_000n;

/**
 * Seed prefixes mirrored from the on-chain program. Kept in one place so the
 * client and program never diverge.
 */
export const SEEDS = {
  vaultAuthority: Buffer.from('vault-authority'),
  vaultState: Buffer.from('vault-state'),
} as const;

/**
 * Decoded representation of the on-chain `Vault` account.
 */
export interface VaultAccount {
  nftMint: PublicKey;
  tokenMint: PublicKey;
  tokenAccount: PublicKey;
  lockedAmount: bigint;
  authorityBump: number;
  stateBump: number;
  initializedSlot: bigint;
  isFunded: boolean;
}

/**
 * The full address set associated with a single NFT-bound vault.
 */
export interface VaultAddresses {
  authority: PublicKey;
  authorityBump: number;
  state: PublicKey;
  stateBump: number;
}

/**
 * Parameters accepted by wrap and unwrap helpers.
 */
export interface VaultOperationParams {
  nftMint: PublicKey;
  tokenMint: PublicKey;
  owner: PublicKey;
}
