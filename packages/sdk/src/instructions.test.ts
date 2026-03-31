import { Keypair, PublicKey } from '@solana/web3.js';
import { describe, expect, it } from 'vitest';

import {
  buildInitializeInstruction,
  buildUnwrapInstruction,
  buildWrapInstruction,
} from './instructions';
import { deriveVaultAddresses } from './pda';
import { NEURALMINT_PROGRAM_ID } from './types';

const programId = new PublicKey(NEURALMINT_PROGRAM_ID);

function fixtureParams() {
  return {
    nftMint: Keypair.generate().publicKey,
    tokenMint: Keypair.generate().publicKey,
    owner: Keypair.generate().publicKey,
  };
}

describe('buildInitializeInstruction', () => {
  it('targets the program id', () => {
    const ix = buildInitializeInstruction(fixtureParams());
    expect(ix.programId.equals(programId)).toBe(true);
  });

  it('marks the payer as the only signer', () => {
    const params = fixtureParams();
    const ix = buildInitializeInstruction(params);
    const signers = ix.keys.filter((k) => k.isSigner);
    expect(signers).toHaveLength(1);
    expect(signers[0].pubkey.equals(params.owner)).toBe(true);
  });

  it('references the derived vault state as writable', () => {
    const params = fixtureParams();
    const { state } = deriveVaultAddresses(params.nftMint);
    const ix = buildInitializeInstruction(params);
    const stateMeta = ix.keys.find((k) => k.pubkey.equals(state));
    expect(stateMeta?.isWritable).toBe(true);
  });
});

describe('buildWrapInstruction', () => {
  it('includes the depositor token account as writable', () => {
    const params = fixtureParams();
    const depositor = Keypair.generate().publicKey;
    const ix = buildWrapInstruction(params, depositor);
    const depositorMeta = ix.keys.find((k) => k.pubkey.equals(depositor));
    expect(depositorMeta?.isWritable).toBe(true);
  });
});

describe('buildUnwrapInstruction', () => {
  it('encodes the unwrap discriminator', () => {
    const params = fixtureParams();
    const ix = buildUnwrapInstruction(
      params,
      Keypair.generate().publicKey,
      Keypair.generate().publicKey
    );
    expect(ix.data).toHaveLength(8);
  });

  it('requires the holder to sign', () => {
    const params = fixtureParams();
    const ix = buildUnwrapInstruction(
      params,
      Keypair.generate().publicKey,
      Keypair.generate().publicKey
    );
    const signer = ix.keys.find((k) => k.isSigner);
    expect(signer?.pubkey.equals(params.owner)).toBe(true);
  });
});
