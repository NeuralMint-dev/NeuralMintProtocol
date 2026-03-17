//! `nmint-core` provides the deterministic primitives that back the NeuralMint
//! token-bound NFT design, decoupled from the Anchor runtime so they can be
//! reused by off-chain tooling, indexers and the test harness.
//!
//! The two derivations that matter are:
//! - the vault authority PDA, the program-owned signer that custodies tokens;
//! - the vault state PDA, the account that records the binding.
//!
//! Both are derived solely from the NFT mint pubkey, which is what makes vault
//! access portable: trading the NFT trades the unwrap rights.

#![deny(missing_docs)]
#![forbid(unsafe_code)]

pub mod math;
pub mod pda;
pub mod vault;

/// Seed prefix for the vault authority PDA.
pub const VAULT_AUTHORITY_SEED: &[u8] = b"vault-authority";

/// Seed prefix for the vault state PDA.
pub const VAULT_STATE_SEED: &[u8] = b"vault-state";

/// Canonical locked amount in base units (1,000,000 tokens at 6 decimals).
pub const LOCKED_AMOUNT: u64 = 1_000_000_000_000;

pub use math::{checked_deposit, checked_withdraw, ui_amount, MathError};
pub use pda::{vault_authority, vault_state, VaultAddresses};
pub use vault::{VaultLedger, VaultStatus};
