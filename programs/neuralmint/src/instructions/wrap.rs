//! `Wrap` instruction: lock the fixed $NMINT amount behind the NFT vault.
//!
//! Transfers `LOCKED_AMOUNT` base units from the depositor into the
//! program-controlled vault token account. The operation is idempotent-guarded
//! by the `is_funded` flag on the vault state.

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

use crate::constants::{LOCKED_AMOUNT, VAULT_STATE_SEED};
use crate::errors::NeuralMintError;
use crate::state::Vault;

#[derive(Accounts)]
pub struct Wrap<'info> {
    #[account(
        mut,
        seeds = [VAULT_STATE_SEED, vault.nft_mint.as_ref()],
        bump = vault.state_bump,
        has_one = token_mint @ NeuralMintError::TokenMintMismatch,
    )]
    pub vault: Account<'info, Vault>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        address = vault.token_account,
    )]
    pub vault_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = token_mint,
        token::authority = depositor,
    )]
    pub depositor_token_account: InterfaceAccount<'info, TokenAccount>,

    pub depositor: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(ctx: Context<Wrap>) -> Result<()> {
    require!(!ctx.accounts.vault.is_funded, NeuralMintError::VaultAlreadyFunded);

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.depositor_token_account.to_account_info(),
        mint: ctx.accounts.token_mint.to_account_info(),
        to: ctx.accounts.vault_token_account.to_account_info(),
        authority: ctx.accounts.depositor.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);

    transfer_checked(cpi_ctx, LOCKED_AMOUNT, ctx.accounts.token_mint.decimals)?;

    let vault = &mut ctx.accounts.vault;
    vault.locked_amount = vault
        .locked_amount
        .checked_add(LOCKED_AMOUNT)
        .ok_or(NeuralMintError::MathOverflow)?;
    vault.is_funded = true;

    msg!("wrap: locked {} base units behind nft {}", LOCKED_AMOUNT, vault.nft_mint);

    Ok(())
}
