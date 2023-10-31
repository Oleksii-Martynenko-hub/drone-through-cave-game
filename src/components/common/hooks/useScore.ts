import { useEffect, useRef, useState } from 'react';
import { WALL_HEIGHT } from 'src/constants';

import { Point } from 'src/types/common';

import { getDistance } from 'src/utils/get-distance';
import { getObjectVelocity } from 'src/utils/get-object-velocity';

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
  const scoreMultiplier = 0.1;
  const previousWall = useRef<{
    index: number;
    positions: [number, number];
  } | null>(null);
  const distance = useRef(0);

  useEffect(() => {
    const currentWall = Math.floor(dronePositionY / WALL_HEIGHT);
    const lastPassedWall = caveWallsData.slice(
      currentWall,
      currentWall + 1,
    )?.[0];

    if (!previousWall.current && currentWall < 1) {
      previousWall.current = { index: currentWall, positions: lastPassedWall };
      return;
    }

    if (lastPassedWall && currentWall !== previousWall.current?.index) {
      const { positions } = previousWall.current!;
      const [left, right] = positions;
      const [lastLeft, lastRight] = lastPassedWall;

      const distancePassedLeft = getDistance(
        { x: left, y: 0 },
        { x: lastLeft, y: 10 },
      );
      const distancePassedRight = getDistance(
        { x: right, y: 0 },
        { x: lastRight, y: 10 },
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

      previousWall.current = { index: currentWall, positions: lastPassedWall };
    }
  }, [dronePositionY]);

  return score;
};
