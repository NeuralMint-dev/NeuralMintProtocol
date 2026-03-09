//! `Initialize` instruction: create the vault state and the program-controlled
//! token account whose authority is the vault PDA derived from the NFT mint.

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::constants::{VAULT_AUTHORITY_SEED, VAULT_STATE_SEED};
use crate::state::Vault;

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// NFT mint that seeds the deterministic vault authority.
    pub nft_mint: InterfaceAccount<'info, Mint>,

    /// The $NMINT mint held by the vault.
    pub token_mint: InterfaceAccount<'info, Mint>,

    /// Vault state PDA, derived from the NFT mint.
    #[account(
        init,
        payer = payer,
        space = Vault::LEN,
        seeds = [VAULT_STATE_SEED, nft_mint.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    /// Program-derived authority. Holds no private key; the program is the
    /// sole signer via seeds.
    /// CHECK: PDA validated by seeds + bump constraint.
    #[account(
        seeds = [VAULT_AUTHORITY_SEED, nft_mint.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    /// Token account owned by the vault authority that will custody $NMINT.
    #[account(
        init,
        payer = payer,
        associated_token::mint = token_mint,
        associated_token::authority = vault_authority,
        associated_token::token_program = token_program
    )]
    pub vault_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    vault.nft_mint = ctx.accounts.nft_mint.key();
    vault.token_mint = ctx.accounts.token_mint.key();
    vault.token_account = ctx.accounts.vault_token_account.key();
    vault.locked_amount = 0;
    vault.authority_bump = ctx.bumps.vault_authority;
    vault.state_bump = ctx.bumps.vault;
    vault.initialized_slot = Clock::get()?.slot;
    vault.is_funded = false;

    msg!(
        "vault initialized: nft_mint={} authority_bump={}",
        vault.nft_mint,
        vault.authority_bump
    );

    Ok(())
}
