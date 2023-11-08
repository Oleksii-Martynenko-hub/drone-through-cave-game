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
  caveSidesData: [number, number][],
  dronePositionY: number,
  droneSpeed: Point,
  complexity: number,
) => {
  const [score, setScore] = useState(0);
  const scoreMultiplier = useRef(0.01);
  const previousPassedSides = useRef<{
    index: number;
    positions: [number, number];
  } | null>(null);
  const distance = useRef(0);

  useEffect(() => {
    const passedSidesIndex = Math.floor(dronePositionY / WALL_HEIGHT);
    const passedSides = caveSidesData.slice(
      passedSidesIndex,
      passedSidesIndex + 1,
    )?.[0];

    if (!previousPassedSides.current && passedSidesIndex < 1) {
      previousPassedSides.current = {
        index: passedSidesIndex,
        positions: passedSides,
      };
      return;
    }

    if (
      passedSides &&
      passedSidesIndex !== previousPassedSides.current?.index
    ) {
      const { positions: previousSides } = previousPassedSides.current!;

      const distancePassed = getAverageLengthOfWall(previousSides, passedSides);

      distance.current += distancePassed;

      const droneVelocity = Math.min(
        getObjectVelocity(droneSpeed.x, droneSpeed.y),
        100,
      );

      const mediumCaveWidth = getCaveWidth(caveSidesData, passedSidesIndex);
      const caveWidthMultiplier = (200 - mediumCaveWidth) / 10;

      const complexityMultiplier = droneVelocity / 2 + complexity * 3;
      const calculatedAdditionalScore = Math.max(
        distancePassed *
          scoreMultiplier.current *
          complexityMultiplier *
          caveWidthMultiplier,
        0,
      );

      setScore((prev) => Math.round(prev + calculatedAdditionalScore));

      previousPassedSides.current = {
        index: passedSidesIndex,
        positions: passedSides,
      };
    }
  }, [dronePositionY]);

  return { score, distance: distance.current };
};
