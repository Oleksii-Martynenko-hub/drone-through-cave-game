import { useRef, useEffect, useState } from 'react';

type Callback = (time: number, deltaTime: number) => void;

export const useAnimationFrame = (callback: Callback) => {
  const [isRunning, setIsRunning] = useState(false);

  const requestID = useRef<number>(0);
  const previousTime = useRef<number | null>(null);

  const loop = (time: number) => {
    if (previousTime.current !== null) {
      const deltaTime = time - previousTime.current;
      callback(time, deltaTime);
    }

    previousTime.current = time;
    requestID.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (isRunning) {
      requestID.current = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(requestID.current);
  }, [isRunning]);

  const run = () => {
    setIsRunning(true);
  };

  const stop = () => {
    cancelAnimationFrame(requestID.current);
    setIsRunning(false);
    previousTime.current = null;
  };

  return { run, stop, isRunning };
};
