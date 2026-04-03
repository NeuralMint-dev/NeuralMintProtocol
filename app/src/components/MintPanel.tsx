'use client';

import { useGSAP } from '@gsap/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRef, useState } from 'react';

import { revealTimeline } from '@/lib/animations';

interface MintPanelProps {
  onSubmit?: (prompt: string) => void;
}

/**
 * Prompt-driven mint panel. Entrance animation is scoped with `useGSAP` so all
 * tweens are reverted automatically when the component unmounts.
 */
export function MintPanel({ onSubmit }: MintPanelProps) {
  const container = useRef<HTMLDivElement>(null);
  const { connected } = useWallet();
  const [prompt, setPrompt] = useState('');

  useGSAP(
    () => {
      revealTimeline('[data-reveal]');
    },
    { scope: container }
  );

  return (
    <div ref={container} className="mint-panel">
      <label data-reveal htmlFor="prompt" className="mint-panel__label">
        Describe your NFT
      </label>
      <textarea
        id="prompt"
        data-reveal
        className="mint-panel__input"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="A bioluminescent koi rendered as circuit topology"
        rows={3}
      />
      <button
        data-reveal
        type="button"
        className="mint-panel__cta"
        disabled={!connected || prompt.trim().length === 0}
        onClick={() => onSubmit?.(prompt.trim())}
      >
        {connected ? 'Generate and mint' : 'Connect wallet to mint'}
      </button>
    </div>
  );
}
