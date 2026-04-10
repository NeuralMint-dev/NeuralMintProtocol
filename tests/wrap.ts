import {
  createAssociatedTokenAccountIdempotent,
  getAccount,
  getAssociatedTokenAddressSync,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { assert } from 'chai';

import { LOCKED_AMOUNT } from '../packages/sdk/src/types';
import { deriveVaultAddresses } from '../packages/sdk/src/pda';
import { bootstrap, type TestContext } from './neuralmint';

async function initVault(ctx: TestContext): Promise<void> {
  await ctx.program.methods
    .initialize()
    .accounts({
      nftMint: ctx.nftMint,
      tokenMint: ctx.tokenMint,
      payer: ctx.payer.publicKey,
    })
    .rpc();
}

describe('neuralmint::wrap', () => {
  it('locks the canonical amount into the vault token account', async () => {
    const ctx = await bootstrap();
    await initVault(ctx);

    const depositor = await createAssociatedTokenAccountIdempotent(
      ctx.provider.connection,
      ctx.payer,
      ctx.tokenMint,
      ctx.payer.publicKey,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    await mintTo(
      ctx.provider.connection,
      ctx.payer,
      ctx.tokenMint,
      depositor,
      ctx.payer,
      LOCKED_AMOUNT,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const { state, authority } = deriveVaultAddresses(ctx.nftMint, ctx.program.programId);
    const vaultAta = getAssociatedTokenAddressSync(
      ctx.tokenMint,
      authority,
      true,
      TOKEN_2022_PROGRAM_ID
    );

    await ctx.program.methods
      .wrap()
      .accounts({
        vault: state,
        tokenMint: ctx.tokenMint,
        vaultTokenAccount: vaultAta,
        depositorTokenAccount: depositor,
        depositor: ctx.payer.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    const vault = await ctx.program.account.vault.fetch(state);
    assert.isTrue(vault.isFunded);
    assert.equal(vault.lockedAmount.toString(), LOCKED_AMOUNT.toString());

    const vaultBalance = await getAccount(
      ctx.provider.connection,
      vaultAta,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    assert.equal(vaultBalance.amount.toString(), LOCKED_AMOUNT.toString());
  });
});
