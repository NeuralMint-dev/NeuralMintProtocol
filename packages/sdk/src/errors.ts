/**
 * Base class for all SDK-level errors. Program errors are wrapped so callers
 * can branch on a stable type rather than parsing log strings.
 */
export class NeuralMintError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'NeuralMintError';
  }
}

/**
 * Raised when a vault account cannot be found for the supplied NFT mint.
 */
export class VaultNotFoundError extends NeuralMintError {
  constructor(public readonly nftMint: string) {
    super(`No vault found for NFT mint ${nftMint}`, 'VAULT_NOT_FOUND');
    this.name = 'VaultNotFoundError';
  }
}

/**
 * Raised when the caller does not hold the NFT gating a vault operation.
 */
export class UnauthorizedHolderError extends NeuralMintError {
  constructor() {
    super('Signer does not hold the NFT that gates this vault', 'UNAUTHORIZED_HOLDER');
    this.name = 'UnauthorizedHolderError';
  }
}

/**
 * Raised when an on-chain account fails to decode into the expected layout.
 */
export class AccountDecodeError extends NeuralMintError {
  constructor(account: string) {
    super(`Failed to decode account data for ${account}`, 'ACCOUNT_DECODE_FAILED');
    this.name = 'AccountDecodeError';
  }
}
