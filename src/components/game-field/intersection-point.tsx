import { Point } from 'src/types/common';

import { GAME_FIELD_MIN_WIDTH } from 'src/constants';

type Props = {
  intersectionPoint: Point;
};

const IntersectionPoint = ({ intersectionPoint }: Props) => {
  return (
    <circle
      cx={intersectionPoint.x + GAME_FIELD_MIN_WIDTH / 2}
      cy={intersectionPoint.y}
      r="1"
      stroke="lightgreen"
      fill="yellow"
      strokeWidth="1"
    />
  );
};

export default IntersectionPoint;
