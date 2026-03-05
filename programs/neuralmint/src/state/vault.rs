//! Vault state account.

use anchor_lang::prelude::*;

/// On-chain record binding an NFT mint to its program-controlled vault.
///
/// The account is itself a PDA derived from `[VAULT_STATE_SEED, nft_mint]`,
/// while the vault authority is a separate PDA derived from
/// `[VAULT_AUTHORITY_SEED, nft_mint]`. Storing both bumps avoids recomputing
/// them on the hot path of `wrap` / `unwrap`.
#[account]
#[derive(Default, Debug)]
pub struct Vault {
    /// NFT mint that gates access to this vault.
    pub nft_mint: Pubkey,
    /// Mint of the token held in the vault ($NMINT).
    pub token_mint: Pubkey,
    /// Associated token account owned by the vault authority PDA.
    pub token_account: Pubkey,
    /// Amount currently locked, in base units.
    pub locked_amount: u64,
    /// Bump for the vault authority PDA.
    pub authority_bump: u8,
    /// Bump for this vault state PDA.
    pub state_bump: u8,
    /// Slot at which the vault was initialized.
    pub initialized_slot: u64,
    /// True once tokens have been wrapped behind the NFT.
    pub is_funded: bool,
}

impl Vault {
    /// Discriminator (8) + fields.
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 1 + 1 + 8 + 1;
}
