import { getDistance } from 'src/utils/get-distance';
import { getTriangleHeight } from 'src/utils/get-triangle-height';

export const getCaveWidth = (
  caveWallsData: [number, number][],
  currentWallIndex: number,
) => {
  const lastPassedWall = caveWallsData.slice(
    currentWallIndex,
    currentWallIndex + 1,
  )?.[0];

  const walls = caveWallsData.slice(
    Math.max(0, currentWallIndex - 3),
    currentWallIndex + 4,
  );

  const l = walls.map(([l, r]) => l);
  const r = walls.map(([l, r]) => r);

  const caveWidth = lastPassedWall.map((px, s) => {
    const side = s === 0 ? r : l;
    const nearestPointsAbove = side.slice(0, 3).map((x, j) => {
      return {
        d: getDistance({ x: px, y: j }, { x, y: -30 + j * 10 }),
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

  return midCaveWidth;
};
