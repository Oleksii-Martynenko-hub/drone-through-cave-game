import { useEffect, useState } from 'react';

import { Point } from 'src/types/common';

import { WALL_HEIGHT } from 'src/constants';

import { findLinesSegmentIntersection } from 'src/utils/find-lines-segment-intersection';

export const useIntersectionPoint = (
  droneSidesPoints: Point[][],
  caveWallsData: [number, number][],
  dronePositionY: number,
) => {
  const [intersectionPoint, setIntersectionPoint] = useState<Point | null>(
    null,
  );

  useEffect(() => {
    if (intersectionPoint) return;

    const offsetY = dronePositionY % WALL_HEIGHT;

    const currentWallNumber = Math.floor(dronePositionY / WALL_HEIGHT);

    const nearestWalls = caveWallsData.slice(
      currentWallNumber,
      currentWallNumber + 3,
    );

    for (let i = 0; i < 2; i++) {
      if (!nearestWalls[i + 1]) break;

      const [l1, r1] = nearestWalls[i];
      const [l2, r2] = nearestWalls[i + 1];

      const y = i * WALL_HEIGHT - offsetY;

      const leftLine = [
        { x: l1, y },
        { x: l2, y: y + WALL_HEIGHT },
      ];
      const rightLine = [
        { x: r1, y },
        { x: r2, y: y + WALL_HEIGHT },
      ];

      for (const [a, b] of [leftLine, rightLine]) {
        for (const [c, d] of droneSidesPoints) {
          const point = findLinesSegmentIntersection(a, b, c, d);

          if (point) {
            setIntersectionPoint(point);
            break;
          }
        }
      }
    }
  }, [droneSidesPoints, dronePositionY]);

  return intersectionPoint;
};
