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
