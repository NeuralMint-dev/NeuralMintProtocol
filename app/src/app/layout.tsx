import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'NeuralMint',
  description:
    'AI-generated NFT minting on Solana with a Token-2022 token-bound vault primitive.',
  metadataBase: new URL('https://neuralmint.art'),
  openGraph: {
    title: 'NeuralMint',
    description: 'Mint AI NFTs that custody a deterministic on-chain vault.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
