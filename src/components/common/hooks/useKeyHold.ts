import { useEffect, useRef } from 'react';

export const useKeyHold = (
  keysWithCallback: {
    [key: string]: (duration: number, isFirstCall: boolean) => void;
  },
  deps: any[],
) => {
  const heldKeys = useRef<{ [key: string]: boolean } | null>(null);
  const isFirstCallKeys = useRef<{ [key: string]: boolean } | null>(null);
  const startHoldingTimeStamps = useRef<{ [key: string]: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (Object.keys(keysWithCallback).includes(event.key)) {
        const prevHeldKeys = heldKeys.current ?? {};
        if (prevHeldKeys[event.key]) return;

        heldKeys.current = { ...prevHeldKeys, [event.key]: true };

        const prevIsFirstCallKeys = isFirstCallKeys.current ?? {};
        isFirstCallKeys.current = { ...prevIsFirstCallKeys, [event.key]: true };

        const prevTimeStamps = startHoldingTimeStamps.current ?? {};
        startHoldingTimeStamps.current = {
          ...prevTimeStamps,
          [event.key]: Date.now(),
        };
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (Object.keys(keysWithCallback).includes(event.key)) {
        const prevHeldKeys = heldKeys.current ?? {};
        heldKeys.current = { ...prevHeldKeys, [event.key]: false };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (
      heldKeys.current &&
      startHoldingTimeStamps.current &&
      isFirstCallKeys.current
    ) {
      Object.keys(heldKeys.current).forEach((key) => {
        if (heldKeys.current?.[key]) {
          keysWithCallback[key](
            Date.now() - startHoldingTimeStamps.current![key],
            isFirstCallKeys.current![key],
          );
          const prevIsFirstCallKeys = isFirstCallKeys.current ?? {};
          isFirstCallKeys.current = { ...prevIsFirstCallKeys, [key]: false };
        }
      });
    }
  }, [...deps]);
};
