import { clusterApiUrl } from '@solana/web3.js';

export type SupportedCluster = 'mainnet-beta' | 'devnet' | 'localnet';

/**
 * Resolves the RPC endpoint for a cluster, preferring an explicit env override
 * so deployments can point at a dedicated provider rather than public RPC.
 */
export function resolveEndpoint(cluster: SupportedCluster): string {
  const override = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
  if (override) {
    return override;
  }

  if (cluster === 'localnet') {
    return 'http://127.0.0.1:8899';
  }

  return clusterApiUrl(cluster);
}

/**
 * Active cluster derived from the environment, defaulting to devnet for safety.
 */
export function activeCluster(): SupportedCluster {
  const value = process.env.NEXT_PUBLIC_CLUSTER as SupportedCluster | undefined;
  return value ?? 'devnet';
}
