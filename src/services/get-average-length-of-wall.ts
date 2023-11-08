import { getDistance } from 'src/utils/get-distance';

export const getAverageLengthOfWall = (
  previousSides: [number, number],
  currentSides: [number, number],
) => {
  const [left, right] = previousSides;
  const [currentLeft, currentRight] = currentSides;
  const centerTop = left - right;
  const centerBottom = currentLeft - currentRight;

  const distancePassed = getDistance(
    { x: centerTop, y: 0 },
    { x: centerBottom, y: 10 },
  );

  return distancePassed;
};
