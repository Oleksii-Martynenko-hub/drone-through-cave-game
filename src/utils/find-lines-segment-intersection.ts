import { Point } from 'src/types/common';

export function findLinesSegmentIntersection(
  line1start: Point,
  line1end: Point,
  line2start: Point,
  line2end: Point
) {
  const l1x1 = line1start.x;
  const l1y1 = line1start.y;
  const l1x2 = line1end.x;
  const l1y2 = line1end.y;

  const l2x1 = line2start.x;
  const l2y1 = line2start.y;
  const l2x2 = line2end.x;
  const l2y2 = line2end.y;

  const denominator =
    (l2y2 - l2y1) * (l1x2 - l1x1) - (l2x2 - l2x1) * (l1y2 - l1y1);

  if (denominator === 0) {
    return null;
  }

  const ua =
    ((l2x2 - l2x1) * (l1y1 - l2y1) - (l2y2 - l2y1) * (l1x1 - l2x1)) /
    denominator;
  const ub =
    ((l1x2 - l1x1) * (l1y1 - l2y1) - (l1y2 - l1y1) * (l1x1 - l2x1)) /
    denominator;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    const intersectionX = l1x1 + ua * (l1x2 - l1x1);
    const intersectionY = l1y1 + ua * (l1y2 - l1y1);
    return { x: intersectionX, y: intersectionY };
  }

  return null;
}
