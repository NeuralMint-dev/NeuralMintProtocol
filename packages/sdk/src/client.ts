import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Connection,
  PublicKey,
  Transaction,
  type Commitment,
  type TransactionInstruction,
} from '@solana/web3.js';

import { AccountDecodeError, VaultNotFoundError } from './errors';
import {
  buildInitializeInstruction,
  buildUnwrapInstruction,
  buildWrapInstruction,
} from './instructions';
import { deriveVaultAddresses, resolveProgramId } from './pda';
import type { VaultAccount, VaultOperationParams } from './types';

export interface NeuralMintClientOptions {
  connection: Connection;
  programId?: PublicKey | string;
  commitment?: Commitment;
}

/**
 * High-level entrypoint for interacting with the NeuralMint program. Composes
 * the lower-level instruction builders into ready-to-sign transactions and
 * decodes vault state.
 */
export class NeuralMintClient {
  private readonly connection: Connection;
  private readonly programId: PublicKey;
  private readonly commitment: Commitment;

  constructor(options: NeuralMintClientOptions) {
    this.connection = options.connection;
    this.programId = resolveProgramId(options.programId);
    this.commitment = options.commitment ?? 'confirmed';
  }

  /**
   * Builds a transaction that initializes a vault for the given NFT mint.
   */
  initializeVaultTx(params: VaultOperationParams): Transaction {
    return this.toTransaction(buildInitializeInstruction(params, this.programId));
  }

  /**
   * Builds a transaction that wraps the canonical amount behind the NFT.
   */
  async wrapTx(params: VaultOperationParams): Promise<Transaction> {
    const depositor = getAssociatedTokenAddressSync(
      params.tokenMint,
      params.owner,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    return this.toTransaction(buildWrapInstruction(params, depositor, this.programId));
  }

  /**
   * Builds a transaction that unwraps locked tokens to the current holder.
   */
  async unwrapTx(params: VaultOperationParams): Promise<Transaction> {
    const nftHolderAccount = getAssociatedTokenAddressSync(
      params.nftMint,
      params.owner,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    const holderTokenAccount = getAssociatedTokenAddressSync(
      params.tokenMint,
      params.owner,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    return this.toTransaction(
      buildUnwrapInstruction(params, nftHolderAccount, holderTokenAccount, this.programId)
    );
  }

  /**
   * Fetches and decodes the vault state for an NFT mint.
   *
   * @throws {VaultNotFoundError} If no account exists at the derived address.
   * @throws {AccountDecodeError} If the account data is malformed.
   */
  async fetchVault(nftMint: PublicKey): Promise<VaultAccount> {
    const { state } = deriveVaultAddresses(nftMint, this.programId);
    const info = await this.connection.getAccountInfo(state, this.commitment);

    if (info === null) {
      throw new VaultNotFoundError(nftMint.toBase58());
    }

    try {
      return decodeVault(info.data);
    } catch {
      throw new AccountDecodeError(state.toBase58());
    }
  }

  private async toTransaction(instruction: TransactionInstruction): Promise<Transaction> {
    const { blockhash } = await this.connection.getLatestBlockhash(this.commitment);
    const tx = new Transaction({ recentBlockhash: blockhash, feePayer: null });
    tx.add(instruction);
    return tx;
  }
}

/**
 * Borsh-compatible decode of the on-chain `Vault` layout (after the 8-byte
 * Anchor discriminator).
 */
function decodeVault(data: Buffer): VaultAccount {
  let offset = 8;

  const readPubkey = (): PublicKey => {
    const key = new PublicKey(data.subarray(offset, offset + 32));
    offset += 32;
    return key;
  };

  const nftMint = readPubkey();
  const tokenMint = readPubkey();
  const tokenAccount = readPubkey();
  const lockedAmount = data.readBigUInt64LE(offset);
  offset += 8;
  const authorityBump = data.readUInt8(offset);
  offset += 1;
  const stateBump = data.readUInt8(offset);
  offset += 1;
  const initializedSlot = data.readBigUInt64LE(offset);
  offset += 8;
  const isFunded = data.readUInt8(offset) === 1;

  return {
    nftMint,
    tokenMint,
    tokenAccount,
    lockedAmount,
    authorityBump,
    stateBump,
    initializedSlot,
    isFunded,
  };
}
