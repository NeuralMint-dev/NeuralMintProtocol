/**
 * Example: unwrap a funded vault as the current NFT holder.
 *
 * Assumes the vault has already been initialized and wrapped (see
 * examples/mint-and-wrap).
 */

import { NeuralMintClient, VaultNotFoundError } from '@neuralmint/sdk';
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

async function main(): Promise<void> {
  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
  const holder = Keypair.generate();

  const nftMint = new PublicKey(process.env.NFT_MINT ?? Keypair.generate().publicKey);
  const tokenMint = new PublicKey(process.env.TOKEN_MINT ?? Keypair.generate().publicKey);

  const client = new NeuralMintClient({ connection });

  try {
    const vault = await client.fetchVault(nftMint);
    if (!vault.isFunded) {
      console.warn('vault is not funded, nothing to unwrap');
      return;
    }
  } catch (error) {
    if (error instanceof VaultNotFoundError) {
      console.warn('no vault for mint', error.nftMint);
      return;
    }
    throw error;
  }

  const unwrapTx = await client.unwrapTx({ nftMint, tokenMint, owner: holder.publicKey });
  const signature = await sendAndConfirmTransaction(connection, unwrapTx, [holder]);
  console.warn('unwrapped, signature:', signature);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
