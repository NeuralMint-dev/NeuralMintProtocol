//! NeuralMint program entrypoint.
//!
//! Implements a token-bound NFT primitive in which a single PDA, derived
//! deterministically from the NFT mint address, owns a vault holding a fixed
//! quantity of the $NMINT mint. Possession of the NFT is equivalent to control
//! of the vault: the program is the sole signer of the vault authority and no
//! external private key exists for it.

use anchor_lang::prelude::*;

pub mod constants;
pub mod state;

declare_id!("NMNTkVyB8z9pXq3rJ7wMfZ2cH6tD4sL1aR5nE8gU0Wv");

#[program]
pub mod neuralmint {
    use super::*;

    /// Bootstraps a vault for a freshly minted NFT and binds it to the
    /// program-derived authority. See subsequent revisions for the full
    /// account validation surface.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("neuralmint: initialize vault for mint {}", ctx.accounts.nft_mint.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// The NFT mint whose pubkey seeds the vault authority PDA.
    /// CHECK: validated against vault state in later revisions.
    pub nft_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
