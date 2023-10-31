import { getDistance } from 'src/utils/get-distance';

export const getAverageLengthOfWall = (
  wall: [number, number],
  lastWall: [number, number],
) => {
  const [left, right] = wall;
  const [lastLeft, lastRight] = lastWall;

  const distancePassedLeft = getDistance(
    { x: left, y: 0 },
    { x: lastLeft, y: 10 },
  );
  const distancePassedRight = getDistance(
    { x: right, y: 0 },
    { x: lastRight, y: 10 },
  );

  return (distancePassedLeft + distancePassedRight) / 2;
};
