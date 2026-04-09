//! `Unwrap` instruction: release the locked $NMINT to the current NFT holder.
//!
//! The vault authority is a PDA with no external signer; the program signs the
//! transfer using the seeds `[VAULT_AUTHORITY_SEED, nft_mint]`. Authorization
//! is enforced by requiring the caller to prove ownership of exactly one unit
//! of the NFT.

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::{NFT_GATING_BALANCE, VAULT_AUTHORITY_SEED, VAULT_STATE_SEED};
use crate::errors::NeuralMintError;
use crate::state::Vault;

#[derive(Accounts)]
pub struct Unwrap<'info> {
    #[account(
        mut,
        seeds = [VAULT_STATE_SEED, vault.nft_mint.as_ref()],
        bump = vault.state_bump,
        has_one = nft_mint @ NeuralMintError::NftMintMismatch,
        has_one = token_mint @ NeuralMintError::TokenMintMismatch,
    )]
    pub vault: Account<'info, Vault>,

    pub nft_mint: InterfaceAccount<'info, Mint>,
    pub token_mint: InterfaceAccount<'info, Mint>,

    /// Vault authority PDA. Signs the outgoing transfer via seeds.
    /// CHECK: validated by seeds + stored bump.
    #[account(
        seeds = [VAULT_AUTHORITY_SEED, nft_mint.key().as_ref()],
        bump = vault.authority_bump,
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        address = vault.token_account,
    )]
    pub vault_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Token account proving the caller holds the gating NFT.
    #[account(
        constraint = nft_holder_account.mint == nft_mint.key() @ NeuralMintError::NftMintMismatch,
        constraint = nft_holder_account.owner == holder.key() @ NeuralMintError::UnauthorizedHolder,
        constraint = nft_holder_account.amount == NFT_GATING_BALANCE @ NeuralMintError::InvalidNftBalance,
    )]
    pub nft_holder_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = token_mint,
        token::authority = holder,
    )]
    pub holder_token_account: InterfaceAccount<'info, TokenAccount>,

    pub holder: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(ctx: Context<Unwrap>) -> Result<()> {
    require!(ctx.accounts.vault.is_funded, NeuralMintError::VaultNotFunded);

    let amount = ctx.accounts.vault.locked_amount;
    let nft_mint_key = ctx.accounts.nft_mint.key();
    let authority_bump = [ctx.accounts.vault.authority_bump];
    let seeds = crate::utils::authority_signer_seeds(&nft_mint_key, &authority_bump);
    let signer_seeds: &[&[&[u8]]] = &[&seeds];

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.vault_token_account.to_account_info(),
        mint: ctx.accounts.token_mint.to_account_info(),
        to: ctx.accounts.holder_token_account.to_account_info(),
        authority: ctx.accounts.vault_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );

    transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;

    let vault = &mut ctx.accounts.vault;
    vault.locked_amount = 0;
    vault.is_funded = false;

    msg!("unwrap: released {} base units to holder {}", amount, ctx.accounts.holder.key());

    Ok(())
}
