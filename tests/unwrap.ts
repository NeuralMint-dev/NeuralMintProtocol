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

async function initAndFund(ctx: TestContext): Promise<void> {
  await ctx.program.methods
    .initialize()
    .accounts({
      nftMint: ctx.nftMint,
      tokenMint: ctx.tokenMint,
      payer: ctx.payer.publicKey,
    })
    .rpc();

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
}

describe('neuralmint::unwrap', () => {
  it('releases the locked balance to the NFT holder', async () => {
    const ctx = await bootstrap();
    await initAndFund(ctx);

    const nftHolderAccount = await createAssociatedTokenAccountIdempotent(
      ctx.provider.connection,
      ctx.payer,
      ctx.nftMint,
      ctx.payer.publicKey,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    await mintTo(
      ctx.provider.connection,
      ctx.payer,
      ctx.nftMint,
      nftHolderAccount,
      ctx.payer,
      1,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const holderToken = await createAssociatedTokenAccountIdempotent(
      ctx.provider.connection,
      ctx.payer,
      ctx.tokenMint,
      ctx.payer.publicKey,
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
      .unwrap()
      .accounts({
        vault: state,
        nftMint: ctx.nftMint,
        tokenMint: ctx.tokenMint,
        vaultAuthority: authority,
        vaultTokenAccount: vaultAta,
        nftHolderAccount,
        holderTokenAccount: holderToken,
        holder: ctx.payer.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    const vault = await ctx.program.account.vault.fetch(state);
    assert.isFalse(vault.isFunded);
    assert.equal(vault.lockedAmount.toNumber(), 0);

    const holderBalance = await getAccount(
      ctx.provider.connection,
      holderToken,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    assert.equal(holderBalance.amount.toString(), LOCKED_AMOUNT.toString());
  });
});
