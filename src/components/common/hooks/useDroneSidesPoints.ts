import { useEffect, useState } from 'react';
import { DRONE_SIDE_SIZE } from 'src/constants';
import { Point } from 'src/types/common';
import { getTriangleHeight } from 'src/utils/get-triangle-height';

export const useDroneSidesPoints = (dronePositionX: number) => {
  const [droneSidesPoints, setDroneSidesPoints] = useState<Point[][]>([]);

  useEffect(() => {
    const halfDroneSide = DRONE_SIDE_SIZE / 2;

    const droneHeight = getTriangleHeight(
      DRONE_SIDE_SIZE,
      DRONE_SIDE_SIZE,
      DRONE_SIDE_SIZE,
    );

    const points = [
      // left side
      [
        { x: dronePositionX - halfDroneSide, y: 0 },
        { x: dronePositionX, y: droneHeight },
      ],
      // right side
      [
        { x: dronePositionX, y: droneHeight },
        { x: dronePositionX + halfDroneSide, y: 0 },
      ],
      // top side
      [
        { x: dronePositionX + halfDroneSide, y: 0 },
        { x: dronePositionX - halfDroneSide, y: 0 },
      ],
    ];

    setDroneSidesPoints(points);
  }, [dronePositionX]);

  return droneSidesPoints;
};
