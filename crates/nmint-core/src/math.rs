//! Checked arithmetic helpers for vault accounting.

use thiserror::Error;

/// Errors raised by vault math.
#[derive(Debug, Error, PartialEq, Eq)]
pub enum MathError {
    /// An addition or subtraction exceeded the representable range.
    #[error("arithmetic overflow")]
    Overflow,
    /// A withdrawal exceeded the available balance.
    #[error("insufficient locked balance")]
    InsufficientBalance,
}

/// Adds `delta` to `balance`, failing on overflow.
pub fn checked_deposit(balance: u64, delta: u64) -> Result<u64, MathError> {
    balance.checked_add(delta).ok_or(MathError::Overflow)
}

/// Subtracts `delta` from `balance`, failing if it would go negative.
pub fn checked_withdraw(balance: u64, delta: u64) -> Result<u64, MathError> {
    balance
        .checked_sub(delta)
        .ok_or(MathError::InsufficientBalance)
}

/// Converts a base-unit amount to a floating-point UI amount for display.
///
/// This is lossy and must never be used for on-chain accounting; it exists for
/// indexers and front-end formatting only.
pub fn ui_amount(base_units: u64, decimals: u8) -> f64 {
    base_units as f64 / 10f64.powi(decimals as i32)
}

/// Converts a whole-token amount to base units, failing on overflow.
///
/// Inverse of [`ui_amount`] for the common case of integer token counts. Used
/// by tooling that accepts human-readable amounts.
pub fn to_base_units(tokens: u64, decimals: u8) -> Result<u64, MathError> {
    let factor = 10u64.checked_pow(decimals as u32).ok_or(MathError::Overflow)?;
    tokens.checked_mul(factor).ok_or(MathError::Overflow)
}

/// Returns true when `amount` equals the canonical locked amount for the vault.
pub fn is_canonical_lock(amount: u64, canonical: u64) -> bool {
    amount == canonical
}
