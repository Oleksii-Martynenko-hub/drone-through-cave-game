import { getDistance } from 'src/utils/get-distance';

export const getAverageLengthOfWall = (
  previousSides: [number, number],
  currentSides: [number, number],
) => {
  const [left, right] = previousSides;
  const [currentLeft, currentRight] = currentSides;
  const centerTop = left + (left - right) / 2;
  const centerBottom = currentLeft + (currentLeft - currentRight) / 2;

  const distancePassed = getDistance(
    { x: centerTop, y: 0 },
    { x: centerBottom, y: 10 },
  );

  return distancePassed;
};
