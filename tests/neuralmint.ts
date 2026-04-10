import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  createAssociatedTokenAccountIdempotent,
  createMint,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { Keypair, PublicKey } from '@solana/web3.js';
import { assert } from 'chai';

import { deriveVaultAddresses } from '../packages/sdk/src/pda';
import type { Neuralmint } from '../target/types/neuralmint';

/**
 * Shared fixtures for the program test-suite. Each spec file re-uses this
 * bootstrap to create an NFT mint, the $NMINT mint and a funded payer.
 */
export interface TestContext {
  program: Program<Neuralmint>;
  provider: anchor.AnchorProvider;
  payer: Keypair;
  nftMint: PublicKey;
  tokenMint: PublicKey;
}

export async function bootstrap(): Promise<TestContext> {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Neuralmint as Program<Neuralmint>;
  const payer = (provider.wallet as anchor.Wallet).payer;

  const tokenMint = await createMint(
    provider.connection,
    payer,
    payer.publicKey,
    null,
    6,
    Keypair.generate(),
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  const nftMint = await createMint(
    provider.connection,
    payer,
    payer.publicKey,
    null,
    0,
    Keypair.generate(),
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  return { program, provider, payer, nftMint, tokenMint };
}

describe('neuralmint::initialize', () => {
  it('creates a vault bound to the NFT mint', async () => {
    const ctx = await bootstrap();
    const { state, authority } = deriveVaultAddresses(ctx.nftMint, ctx.program.programId);

    await ctx.program.methods
      .initialize()
      .accounts({
        nftMint: ctx.nftMint,
        tokenMint: ctx.tokenMint,
        payer: ctx.payer.publicKey,
      })
      .rpc();

    const vault = await ctx.program.account.vault.fetch(state);
    assert.isTrue(vault.nftMint.equals(ctx.nftMint));
    assert.isTrue(vault.tokenMint.equals(ctx.tokenMint));
    assert.equal(vault.lockedAmount.toNumber(), 0);
    assert.isFalse(vault.isFunded);
    assert.isAbove(vault.authorityBump, 0);
    assert.ok(authority);
  });

  it('rejects a second initialize for the same mint', async () => {
    const ctx = await bootstrap();
    await ctx.program.methods
      .initialize()
      .accounts({
        nftMint: ctx.nftMint,
        tokenMint: ctx.tokenMint,
        payer: ctx.payer.publicKey,
      })
      .rpc();

    try {
      await ctx.program.methods
        .initialize()
        .accounts({
          nftMint: ctx.nftMint,
          tokenMint: ctx.tokenMint,
          payer: ctx.payer.publicKey,
        })
        .rpc();
      assert.fail('expected duplicate initialize to fail');
    } catch (err) {
      assert.match(String(err), /already in use|custom program error/i);
    }
  });
});

void createAssociatedTokenAccountIdempotent;
void mintTo;
