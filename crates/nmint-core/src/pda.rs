//! Program-derived address helpers.

use solana_program::pubkey::{Pubkey, PubkeyError};

use crate::{VAULT_AUTHORITY_SEED, VAULT_STATE_SEED};

/// The full set of addresses associated with a single NFT-bound vault.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct VaultAddresses {
    /// Vault authority PDA (program-owned signer).
    pub authority: Pubkey,
    /// Canonical bump for the authority PDA.
    pub authority_bump: u8,
    /// Vault state PDA.
    pub state: Pubkey,
    /// Canonical bump for the state PDA.
    pub state_bump: u8,
}

impl VaultAddresses {
    /// Derives both PDAs for a given NFT mint under `program_id`.
    pub fn derive(nft_mint: &Pubkey, program_id: &Pubkey) -> Self {
        let (authority, authority_bump) = vault_authority(nft_mint, program_id);
        let (state, state_bump) = vault_state(nft_mint, program_id);
        Self {
            authority,
            authority_bump,
            state,
            state_bump,
        }
    }
}

/// Derives the vault authority PDA and bump for `nft_mint`.
pub fn vault_authority(nft_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[VAULT_AUTHORITY_SEED, nft_mint.as_ref()], program_id)
}

/// Derives the vault state PDA and bump for `nft_mint`.
pub fn vault_state(nft_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[VAULT_STATE_SEED, nft_mint.as_ref()], program_id)
}

/// Reconstructs the vault authority PDA from a previously stored bump.
///
/// `find_program_address` iterates from bump 255 downward and hashes on each
/// attempt; once the canonical bump is known (it is persisted on the vault
/// state account) we can skip straight to a single `create_program_address`
/// call, which is markedly cheaper on the compute-budget-constrained hot path.
pub fn vault_authority_with_bump(
    nft_mint: &Pubkey,
    bump: u8,
    program_id: &Pubkey,
) -> Result<Pubkey, PubkeyError> {
    Pubkey::create_program_address(
        &[VAULT_AUTHORITY_SEED, nft_mint.as_ref(), &[bump]],
        program_id,
    )
}
