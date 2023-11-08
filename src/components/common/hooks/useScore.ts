import { useEffect, useRef, useState } from 'react';

import { WALL_HEIGHT } from 'src/constants';

import { Point } from 'src/types/common';

import { getObjectVelocity } from 'src/utils/get-object-velocity';

import { getCaveWidth } from 'src/services/get-cave-width';
import { getAverageLengthOfWall } from 'src/services/get-average-length-of-wall';

export const useScore = (
  wallsPassed: number,
  droneVerticalSpeed: number,
  complexity: number,
) => {
  const [score, setScore] = useState(0);
  const scoreMultiplier = 1;

  useEffect(() => {
    setScore(
      (prev) => prev + scoreMultiplier * (droneVerticalSpeed + complexity),
    );
  }, [wallsPassed]);

  return score;
};

export const useScoreBetter = (
  caveWallsData: [number, number][],
  dronePositionY: number,
  droneSpeed: Point,
  complexity: number,
) => {
  const [score, setScore] = useState(0);
  const scoreMultiplier = useRef(0.01);
  const previousWall = useRef<{
    index: number;
    positions: [number, number];
  } | null>(null);
  const distance = useRef(0);

  useEffect(() => {
    const currentWallIndex = Math.floor(dronePositionY / WALL_HEIGHT);
    const lastPassedWall = caveWallsData.slice(
      currentWallIndex,
      currentWallIndex + 1,
    )?.[0];

    if (!previousWall.current && currentWallIndex < 1) {
      previousWall.current = {
        index: currentWallIndex,
        positions: lastPassedWall,
      };
      return;
    }

    if (lastPassedWall && currentWallIndex !== previousWall.current?.index) {
      const { positions: wall } = previousWall.current!;

      const distancePassed = getAverageLengthOfWall(wall, lastPassedWall);

      distance.current += distancePassed;

      const droneVelocity = Math.min(
        getObjectVelocity(droneSpeed.x, droneSpeed.y),
        100,
      );

      const midCaveWidth = getCaveWidth(caveWallsData, currentWallIndex);
      const caveWidthMultiplier = (200 - midCaveWidth) / 10;

      const complexityMultiplier = droneVelocity / 2 + complexity * 3;
      const calculatedAdditionalScore = Math.max(
        distancePassed *
          scoreMultiplier.current *
          complexityMultiplier *
          caveWidthMultiplier,
        0,
      );

      setScore((prev) => Math.round(prev + calculatedAdditionalScore));

      previousWall.current = {
        index: currentWallIndex,
        positions: lastPassedWall,
      };
    }
  }, [dronePositionY]);

  return { score, distance: distance.current };
};
