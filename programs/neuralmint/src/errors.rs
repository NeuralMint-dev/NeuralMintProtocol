//! Domain error codes surfaced by the NeuralMint program.

use anchor_lang::prelude::*;

#[error_code]
pub enum NeuralMintError {
    #[msg("Vault authority PDA does not match the derived address")]
    InvalidVaultAuthority,

    #[msg("Provided NFT mint does not match the vault binding")]
    NftMintMismatch,

    #[msg("Token mint does not match the configured $NMINT mint")]
    TokenMintMismatch,

    #[msg("Caller does not hold the NFT that gates this vault")]
    UnauthorizedHolder,

    #[msg("NFT holding account must contain exactly one token")]
    InvalidNftBalance,

    #[msg("Vault has already been funded")]
    VaultAlreadyFunded,

    #[msg("Vault has not been funded with the locked amount")]
    VaultNotFunded,

    #[msg("Locked amount does not equal the protocol constant")]
    InvalidLockedAmount,

    #[msg("Arithmetic overflow while computing vault balances")]
    MathOverflow,

    #[msg("Bump seed could not be resolved for the requested PDA")]
    BumpNotFound,
}
