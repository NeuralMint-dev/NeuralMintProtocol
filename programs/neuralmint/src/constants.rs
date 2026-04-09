//! Program-wide constants and PDA seed prefixes.

use anchor_lang::prelude::*;

/// Seed prefix for the vault authority PDA. The full seed set is
/// `[VAULT_AUTHORITY_SEED, nft_mint]`.
#[constant]
pub const VAULT_AUTHORITY_SEED: &[u8] = b"vault-authority";

/// Seed prefix for the vault state account PDA.
#[constant]
pub const VAULT_STATE_SEED: &[u8] = b"vault-state";

/// Fixed quantity of $NMINT locked behind every NFT, expressed in base units.
/// 1,000,000 tokens at 6 decimals.
pub const LOCKED_AMOUNT: u64 = 1_000_000_000_000;

/// Decimals used by the $NMINT mint.
pub const NMINT_DECIMALS: u8 = 6;

/// Expected balance of an NFT holding account that gates a vault. NFTs are
/// non-fungible, so the gating account must contain exactly one unit.
pub const NFT_GATING_BALANCE: u64 = 1;
