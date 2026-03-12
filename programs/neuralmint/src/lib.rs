//! NeuralMint program entrypoint.
//!
//! Implements a token-bound NFT primitive in which a single PDA, derived
//! deterministically from the NFT mint address, owns a vault holding a fixed
//! quantity of the $NMINT mint. Possession of the NFT is equivalent to control
//! of the vault: the program is the sole signer of the vault authority and no
//! external private key exists for it.

use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("NMNTkVyB8z9pXq3rJ7wMfZ2cH6tD4sL1aR5nE8gU0Wv");

#[program]
pub mod neuralmint {
    use super::*;

    /// Create the vault state and program-controlled token account bound to a
    /// freshly minted NFT.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    /// Lock the fixed $NMINT amount behind the NFT vault.
    pub fn wrap(ctx: Context<Wrap>) -> Result<()> {
        instructions::wrap::handler(ctx)
    }

    /// Release the locked $NMINT to the current NFT holder.
    pub fn unwrap(ctx: Context<Unwrap>) -> Result<()> {
        instructions::unwrap::handler(ctx)
    }
}
