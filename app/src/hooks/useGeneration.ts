'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { requestGeneration, type GenerationResult } from '@/lib/ai';

type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

interface GenerationState {
  status: GenerationStatus;
  result: GenerationResult | null;
  error: string | null;
}

const INITIAL_STATE: GenerationState = {
  status: 'idle',
  result: null,
  error: null,
};

/**
 * Manages the lifecycle of an AI generation request, including cancellation of
 * in-flight requests when a new one starts or the component unmounts.
 */
export function useGeneration() {
  const [state, setState] = useState<GenerationState>(INITIAL_STATE);
  const controllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (prompt: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState({ status: 'generating', result: null, error: null });

    try {
      const result = await requestGeneration({ prompt }, controller.signal);
      setState({ status: 'success', result, error: null });
      return result;
    } catch (error) {
      if (controller.signal.aborted) {
        return null;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      setState({ status: 'error', result: null, error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState(INITIAL_STATE);
  }, []);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return { ...state, generate, reset };
}
