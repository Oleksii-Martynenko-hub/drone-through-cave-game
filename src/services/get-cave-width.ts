import { getDistance } from 'src/utils/get-distance';
import { getTriangleHeight } from 'src/utils/get-triangle-height';

export const getCaveWidth = (
  caveSidesData: [number, number][],
  passedSidesIndex: number,
) => {
  const passedSides = caveSidesData.slice(
    passedSidesIndex,
    passedSidesIndex + 1,
  )?.[0];

  // get passed sides, 3 above and 3 below
  const nearestSides = caveSidesData.slice(
    Math.max(0, passedSidesIndex - 3),
    passedSidesIndex + 4,
  );

  const leftSides = nearestSides.map(([l, _]) => l); // only left side positions
  const rightSides = nearestSides.map(([_, r]) => r); // only right side positions

  const caveWidths = passedSides.map((px, sideIndex) => {
    /** sideIndex == 0 it left side of passed sides,
     * means we get nearest right sides as opposite and vice versa */
    const oppositeSides = sideIndex === 0 ? rightSides : leftSides;

    // calculate distance to all opposite points to find 2 nearest
    const nearestOppositePoints = oppositeSides
      .map((x, i) => {
        const oppositePoint = { x, y: -30 + i * 10 };
        return {
          distance: getDistance({ x: px, y: 0 }, oppositePoint),
          point: oppositePoint,
        };
      })
      .sort((a, b) => a.distance - b.distance);

    if (nearestOppositePoints.length < 2) {
      // if not enough nearest points return ~max width of cave
      return 200;
    }

    // get distance between two nearest points
    const sideA = getDistance(
      nearestOppositePoints[0].point,
      nearestOppositePoints[1].point,
    );

    /* and get height of triangle which forms
     * from passedPoint and two nearest points
     * this height is width of cave  */
    return getTriangleHeight(
      sideA,
      nearestOppositePoints[0].distance,
      nearestOppositePoints[1].distance,
    );
  });

  const mediumCaveWidth = (caveWidths[0] + caveWidths[1]) / 2;

  return mediumCaveWidth;
};
