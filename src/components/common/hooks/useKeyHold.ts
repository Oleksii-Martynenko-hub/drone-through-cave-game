import { useEffect, useRef, useState } from 'react';

export const useKeyHold = (
  key: string,
  callback: (duration: number) => void,
  intervalTime = 30
) => {
  const [isKeyHolding, setIsKeyHolding] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalId = useRef<NodeJS.Timer | null>(null);

  const startInterval = () => {
    intervalId.current = setInterval(() => {
      setDuration((prevDuration) => prevDuration + intervalTime);
    }, intervalTime);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        if (!intervalId.current) setDuration(0);
        setIsKeyHolding(true);
        if (!intervalId.current) startInterval();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === key) {
        if (intervalId.current) clearInterval(intervalId.current);
        intervalId.current = null;
        setIsKeyHolding(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
      intervalId.current = null;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isKeyHolding) {
      callback(duration);
    }
  }, [isKeyHolding, duration]);

  return [isKeyHolding, duration] as const;
};
