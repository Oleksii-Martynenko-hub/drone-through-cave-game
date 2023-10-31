import { Point } from 'src/types/common';

import { getObjectVelocity } from './get-object-velocity';

export function getDistance(p1: Point, p2: Point) {
  const xDistance = p2.x - p1.x;
  const yDistance = p2.y - p1.y;

  return getObjectVelocity(xDistance, yDistance);
}
