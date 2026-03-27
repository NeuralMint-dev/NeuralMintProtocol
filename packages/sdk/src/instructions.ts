import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  type AccountMeta,
} from '@solana/web3.js';

import { deriveVaultAddresses, resolveProgramId } from './pda';
import type { VaultOperationParams } from './types';

/**
 * Anchor instruction discriminators (first 8 bytes of the sighash). Precomputed
 * to avoid pulling the full IDL into builders that only need to encode calls.
 */
const DISCRIMINATOR = {
  initialize: Uint8Array.from([175, 175, 109, 31, 13, 152, 155, 237]),
  wrap: Uint8Array.from([178, 40, 10, 189, 228, 129, 186, 140]),
  unwrap: Uint8Array.from([130, 95, 153, 81, 134, 53, 49, 28]),
} as const;

function meta(pubkey: PublicKey, isSigner: boolean, isWritable: boolean): AccountMeta {
  return { pubkey, isSigner, isWritable };
}

/**
 * Builds the `initialize` instruction that creates a vault for an NFT mint.
 */
export function buildInitializeInstruction(
  params: VaultOperationParams,
  programId?: PublicKey | string
): TransactionInstruction {
  const pid = resolveProgramId(programId);
  const { authority, state } = deriveVaultAddresses(params.nftMint, pid);
  const vaultTokenAccount = getAssociatedTokenAddressSync(
    params.tokenMint,
    authority,
    true,
    TOKEN_2022_PROGRAM_ID
  );

  return new TransactionInstruction({
    programId: pid,
    keys: [
      meta(params.nftMint, false, false),
      meta(params.tokenMint, false, false),
      meta(state, false, true),
      meta(authority, false, false),
      meta(vaultTokenAccount, false, true),
      meta(params.owner, true, true),
      meta(TOKEN_2022_PROGRAM_ID, false, false),
      meta(ASSOCIATED_TOKEN_PROGRAM_ID, false, false),
      meta(SystemProgram.programId, false, false),
    ],
    data: Buffer.from(DISCRIMINATOR.initialize),
  });
}

/**
 * Builds the `wrap` instruction that locks the canonical amount behind the NFT.
 */
export function buildWrapInstruction(
  params: VaultOperationParams,
  depositorTokenAccount: PublicKey,
  programId?: PublicKey | string
): TransactionInstruction {
  const pid = resolveProgramId(programId);
  const { authority, state } = deriveVaultAddresses(params.nftMint, pid);
  const vaultTokenAccount = getAssociatedTokenAddressSync(
    params.tokenMint,
    authority,
    true,
    TOKEN_2022_PROGRAM_ID
  );

  return new TransactionInstruction({
    programId: pid,
    keys: [
      meta(state, false, true),
      meta(params.tokenMint, false, false),
      meta(vaultTokenAccount, false, true),
      meta(depositorTokenAccount, false, true),
      meta(params.owner, true, false),
      meta(TOKEN_2022_PROGRAM_ID, false, false),
    ],
    data: Buffer.from(DISCRIMINATOR.wrap),
  });
}

/**
 * Builds the `unwrap` instruction that releases locked tokens to the holder.
 */
export function buildUnwrapInstruction(
  params: VaultOperationParams,
  nftHolderAccount: PublicKey,
  holderTokenAccount: PublicKey,
  programId?: PublicKey | string
): TransactionInstruction {
  const pid = resolveProgramId(programId);
  const { authority, state } = deriveVaultAddresses(params.nftMint, pid);
  const vaultTokenAccount = getAssociatedTokenAddressSync(
    params.tokenMint,
    authority,
    true,
    TOKEN_2022_PROGRAM_ID
  );

  return new TransactionInstruction({
    programId: pid,
    keys: [
      meta(state, false, true),
      meta(params.nftMint, false, false),
      meta(params.tokenMint, false, false),
      meta(authority, false, false),
      meta(vaultTokenAccount, false, true),
      meta(nftHolderAccount, false, false),
      meta(holderTokenAccount, false, true),
      meta(params.owner, true, false),
      meta(TOKEN_2022_PROGRAM_ID, false, false),
    ],
    data: Buffer.from(DISCRIMINATOR.unwrap),
  });
}
