/**
 * Example: initialize a vault for an NFT mint and lock the canonical balance.
 *
 * Run against a localnet validator started with scripts/test-validator.sh.
 */

import { NeuralMintClient } from '@neuralmint/sdk';
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

async function main(): Promise<void> {
  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
  const payer = Keypair.generate();

  // In a real flow these come from the mint pipeline and the $NMINT config.
  const nftMint = new PublicKey(process.env.NFT_MINT ?? Keypair.generate().publicKey);
  const tokenMint = new PublicKey(process.env.TOKEN_MINT ?? Keypair.generate().publicKey);

  const client = new NeuralMintClient({ connection });
  const params = { nftMint, tokenMint, owner: payer.publicKey };

  const initTx = client.initializeVaultTx(params);
  await sendAndConfirmTransaction(connection, initTx, [payer]);
  console.warn('vault initialized for', nftMint.toBase58());

  const wrapTx = await client.wrapTx(params);
  await sendAndConfirmTransaction(connection, wrapTx, [payer]);

  const vault = await client.fetchVault(nftMint);
  console.warn('locked amount:', vault.lockedAmount.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
