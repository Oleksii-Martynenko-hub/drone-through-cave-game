import { useEffect, useRef, useState } from 'react';
import { WALL_HEIGHT } from 'src/constants';

import { Point } from 'src/types/common';

import { getDistance } from 'src/utils/get-distance';
import { getObjectVelocity } from 'src/utils/get-object-velocity';
import { getTriangleHeight } from 'src/utils/get-triangle-height';

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

      const walls = caveWallsData.slice(
        Math.max(0, currentWall - 3),
        currentWall + 4,
      );

      const l = walls.map(([l, r]) => l);
      const r = walls.map(([l, r]) => r);

      const caveWidth = lastPassedWall.map((px, s) => {
        const side = s === 0 ? r : l;
        const nearestPointsAbove = side.slice(0, 3).map((x, j) => {
          return {
            d: getDistance({ x: px, y: j }, { x: x, y: -30 + j * 10 }),
            p: { x, y: -30 + j * 10 },
          };
        });
        const nearestPointsBelow = side.slice(3, 7).map((x, j) => {
          return {
            d: getDistance({ x: px, y: j }, { x, y: j * 10 }),
            p: { x, y: j * 10 },
          };
        });

        const sortedNearestPoints = nearestPointsAbove
          .concat(nearestPointsBelow)
          .sort((a, b) => {
            return a.d - b.d;
          });

        if (sortedNearestPoints.length >= 2) {
          const sideA = getDistance(
            sortedNearestPoints[0].p,
            sortedNearestPoints[1].p,
          );
          return getTriangleHeight(
            sideA,
            sortedNearestPoints[0].d,
            sortedNearestPoints[1].d,
          );
        }

        return 200;
      });

      const midCaveWidth = (caveWidth[0] + caveWidth[1]) / 2;
      const caveWidthMultiplier = (200 - midCaveWidth) / 10;

      const complexityMultiplier = droneVelocity + complexity * 2;
      const calculatedAdditionalScore = Math.max(
        distancePassed * scoreMultiplier * complexityMultiplier +
          caveWidthMultiplier,
        0,
      );

      setScore((prev) => Math.round(prev + calculatedAdditionalScore));

      previousWall.current = { index: currentWall, positions: lastPassedWall };
    }
  }, [dronePositionY]);

  return { score, distance: distance.current };
};
