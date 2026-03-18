//! Determinism and uniqueness properties for vault PDA derivation.

use nmint_core::{vault_authority, vault_state, VaultAddresses};
use solana_program::pubkey::Pubkey;

const PROGRAM_ID: Pubkey = solana_program::pubkey!("NMNTkVyB8z9pXq3rJ7wMfZ2cH6tD4sL1aR5nE8gU0Wv");

#[test]
fn derivation_is_deterministic() {
    let nft = Pubkey::new_unique();

    let first = VaultAddresses::derive(&nft, &PROGRAM_ID);
    let second = VaultAddresses::derive(&nft, &PROGRAM_ID);

    assert_eq!(first, second, "derivation must be stable for a fixed mint");
}

#[test]
fn authority_and_state_are_distinct() {
    let nft = Pubkey::new_unique();
    let addrs = VaultAddresses::derive(&nft, &PROGRAM_ID);

    assert_ne!(
        addrs.authority, addrs.state,
        "authority and state PDAs must not collide"
    );
}

#[test]
fn distinct_mints_yield_distinct_vaults() {
    let a = VaultAddresses::derive(&Pubkey::new_unique(), &PROGRAM_ID);
    let b = VaultAddresses::derive(&Pubkey::new_unique(), &PROGRAM_ID);

    assert_ne!(a.authority, b.authority);
    assert_ne!(a.state, b.state);
}

#[test]
fn helper_functions_match_aggregate() {
    let nft = Pubkey::new_unique();
    let addrs = VaultAddresses::derive(&nft, &PROGRAM_ID);

    let (authority, authority_bump) = vault_authority(&nft, &PROGRAM_ID);
    let (state, state_bump) = vault_state(&nft, &PROGRAM_ID);

    assert_eq!(addrs.authority, authority);
    assert_eq!(addrs.authority_bump, authority_bump);
    assert_eq!(addrs.state, state);
    assert_eq!(addrs.state_bump, state_bump);
}
