'use client';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  BackpackWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { useMemo, type ReactNode } from 'react';

import { activeCluster, resolveEndpoint } from '@/lib/wallets';

import '@solana/wallet-adapter-react-ui/styles.css';

/**
 * Wires the Solana wallet-adapter stack. Adapters are memoized so the wallet
 * list is stable across renders, as recommended by the adapter docs.
 */
export function AppWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => resolveEndpoint(activeCluster()), []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
