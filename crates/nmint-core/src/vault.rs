//! A minimal, runtime-agnostic model of vault state used to validate
//! transitions before they are submitted on-chain.

use crate::math::{checked_deposit, checked_withdraw, MathError};
use crate::LOCKED_AMOUNT;

/// Lifecycle state of a vault.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum VaultStatus {
    /// Initialized but no tokens locked yet.
    Empty,
    /// Funded with the canonical locked amount.
    Funded,
}

/// Off-chain mirror of the on-chain vault ledger.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct VaultLedger {
    locked_amount: u64,
    status: VaultStatus,
}

impl VaultLedger {
    /// Creates an empty ledger.
    pub fn new() -> Self {
        Self {
            locked_amount: 0,
            status: VaultStatus::Empty,
        }
    }

    /// Current locked balance in base units.
    pub fn locked_amount(&self) -> u64 {
        self.locked_amount
    }

    /// Current lifecycle status.
    pub fn status(&self) -> VaultStatus {
        self.status
    }

    /// Applies a wrap, locking the canonical amount.
    pub fn wrap(&mut self) -> Result<(), MathError> {
        self.locked_amount = checked_deposit(self.locked_amount, LOCKED_AMOUNT)?;
        self.status = VaultStatus::Funded;
        Ok(())
    }

    /// Applies an unwrap, releasing the full balance.
    pub fn unwrap(&mut self) -> Result<u64, MathError> {
        let released = self.locked_amount;
        self.locked_amount = checked_withdraw(self.locked_amount, released)?;
        self.status = VaultStatus::Empty;
        Ok(released)
    }
}

impl Default for VaultLedger {
    fn default() -> Self {
        Self::new()
    }
}
