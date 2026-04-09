//! On-chain signing helpers.
//!
//! Address derivation for off-chain callers now lives in the standalone
//! `nmint-core` crate; the program keeps only what it needs to sign as the
//! vault authority during CPI.

use anchor_lang::prelude::*;

use crate::constants::VAULT_AUTHORITY_SEED;

/// Reconstructs the vault authority signer seeds for CPI signing.
///
/// The bump is read from the persisted vault state so the program never pays
/// for an on-chain `find_program_address` search.
pub fn authority_signer_seeds<'a>(nft_mint: &'a Pubkey, bump: &'a [u8; 1]) -> [&'a [u8]; 3] {
    [VAULT_AUTHORITY_SEED, nft_mint.as_ref(), bump]
}
