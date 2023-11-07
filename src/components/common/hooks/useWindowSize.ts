import { useLayoutEffect, useState } from 'react';

import { AppendToKeys } from 'src/types/common';

interface WindowSize {
  width: number;
  height: number;
}

type WindowOffset = Partial<AppendToKeys<WindowSize, 'Offset'>>;

export function useWindowSize(windowOffset?: WindowOffset): WindowSize {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth + (windowOffset?.widthOffset || 0),
        height: window.innerHeight + (windowOffset?.heightOffset || 0),
      });
    }

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
