import { PublicKey } from '@solana/web3.js';

import { NEURALMINT_PROGRAM_ID, SEEDS, type VaultAddresses } from './types';

/**
 * Resolves the program id, accepting either the default deployed id or an
 * override for localnet and devnet.
 */
export function resolveProgramId(programId: PublicKey | string = NEURALMINT_PROGRAM_ID): PublicKey {
  return typeof programId === 'string' ? new PublicKey(programId) : programId;
}

/**
 * Derives the vault authority PDA for a given NFT mint.
 *
 * @param nftMint - Mint that seeds the deterministic authority.
 * @param programId - Optional program id override.
 * @returns The PDA and its canonical bump.
 */
export function deriveVaultAuthority(
  nftMint: PublicKey,
  programId?: PublicKey | string
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.vaultAuthority, nftMint.toBuffer()],
    resolveProgramId(programId)
  );
}

/**
 * Derives the vault state PDA for a given NFT mint.
 */
export function deriveVaultState(
  nftMint: PublicKey,
  programId?: PublicKey | string
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.vaultState, nftMint.toBuffer()],
    resolveProgramId(programId)
  );
}

/**
 * Convenience helper returning the full address set for an NFT-bound vault.
 */
export function deriveVaultAddresses(
  nftMint: PublicKey,
  programId?: PublicKey | string
): VaultAddresses {
  const [authority, authorityBump] = deriveVaultAuthority(nftMint, programId);
  const [state, stateBump] = deriveVaultState(nftMint, programId);
  return { authority, authorityBump, state, stateBump };
}
