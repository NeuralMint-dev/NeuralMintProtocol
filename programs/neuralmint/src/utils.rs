//! Shared helpers for deterministic PDA derivation.
//!
//! Centralizing derivation keeps the seed scheme in a single place and lets
//! both on-chain handlers and integration tests agree on addresses without
//! duplicating the seed literals.

use anchor_lang::prelude::*;

use crate::constants::{VAULT_AUTHORITY_SEED, VAULT_STATE_SEED};

/// Derives the vault authority PDA for a given NFT mint.
pub fn vault_authority_pda(nft_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[VAULT_AUTHORITY_SEED, nft_mint.as_ref()], program_id)
}

/// Derives the vault state PDA for a given NFT mint.
pub fn vault_state_pda(nft_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[VAULT_STATE_SEED, nft_mint.as_ref()], program_id)
}

/// Reconstructs the vault authority signer seeds for CPI signing.
pub fn authority_signer_seeds<'a>(nft_mint: &'a Pubkey, bump: &'a [u8; 1]) -> [&'a [u8]; 3] {
    [VAULT_AUTHORITY_SEED, nft_mint.as_ref(), bump]
}
