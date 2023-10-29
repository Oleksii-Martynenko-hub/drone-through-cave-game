import { useEffect, useRef, useState } from 'react';

import { Point } from 'src/types/common';

import { getDistance } from 'src/utils/get-distance';
import { getObjectVelocity } from 'src/utils/get-object-velocity';

export const useScore = (
  wallsPassed: number,
  droneVerticalSpeed: number,
  complexity: number
) => {
  const [score, setScore] = useState(0);
  const scoreMultiplier = 1;

  useEffect(() => {
    setScore(
      (prev) => prev + scoreMultiplier * (droneVerticalSpeed + complexity)
    );
  }, [wallsPassed]);

  return score;
};
export const useScoreBetter = (
  lastPassedWall: [number, number],
  droneSpeed: Point,
  complexity: number
) => {
  const [score, setScore] = useState(0);
  const scoreMultiplier = 0.1;
  const prevWall = useRef(lastPassedWall);
  const distance = useRef(0);

  useEffect(() => {
    if (prevWall.current && lastPassedWall) {
      const distancePassedLeft = getDistance(
        { x: prevWall.current?.[0] || 0, y: 0 },
        { x: lastPassedWall?.[0] || 0, y: 10 }
      );
      const distancePassedRight = getDistance(
        { x: prevWall.current?.[1] || 0, y: 0 },
        { x: lastPassedWall?.[1] || 0, y: 10 }
      );

      const distancePassed = (distancePassedLeft + distancePassedRight) / 2;

      distance.current += distancePassed;

      const droneVelocity = getObjectVelocity(droneSpeed.x, droneSpeed.y);

      // TODO: improve by calculate smallest cave width
      // instead width between l and r points on the same height
      const caveWidth = lastPassedWall[1] - lastPassedWall[0];
      const caveWidthMultiplier = (200 - caveWidth) / 10;

      const complexityMultiplier = droneVelocity + complexity * 2;
      const calculatedAdditionalScore =
        distancePassed * scoreMultiplier * complexityMultiplier +
        caveWidthMultiplier;

      setScore((prev) => Math.round(prev + calculatedAdditionalScore));
    }

    prevWall.current = lastPassedWall;
  }, [lastPassedWall]);

  return score;
};
