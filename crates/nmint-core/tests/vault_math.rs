//! Vault ledger lifecycle and arithmetic safety tests.

use nmint_core::{
    checked_deposit, checked_withdraw, MathError, VaultLedger, VaultStatus, LOCKED_AMOUNT,
};

#[test]
fn fresh_ledger_is_empty() {
    let ledger = VaultLedger::new();
    assert_eq!(ledger.locked_amount(), 0);
    assert_eq!(ledger.status(), VaultStatus::Empty);
}

#[test]
fn wrap_locks_canonical_amount() {
    let mut ledger = VaultLedger::new();
    ledger.wrap().expect("wrap should succeed on empty ledger");

    assert_eq!(ledger.locked_amount(), LOCKED_AMOUNT);
    assert_eq!(ledger.status(), VaultStatus::Funded);
}

#[test]
fn unwrap_releases_full_balance() {
    let mut ledger = VaultLedger::new();
    ledger.wrap().unwrap();

    let released = ledger.unwrap().expect("unwrap should succeed when funded");

    assert_eq!(released, LOCKED_AMOUNT);
    assert_eq!(ledger.locked_amount(), 0);
    assert_eq!(ledger.status(), VaultStatus::Empty);
}

#[test]
fn deposit_overflow_is_rejected() {
    assert_eq!(checked_deposit(u64::MAX, 1), Err(MathError::Overflow));
}

#[test]
fn withdraw_beyond_balance_is_rejected() {
    assert_eq!(
        checked_withdraw(0, 1),
        Err(MathError::InsufficientBalance)
    );
}
