import { Point } from 'src/types/common';

import { GAME_FIELD_MIN_WIDTH } from 'src/constants';

type Props = {
  droneSidesPoints: Point[][];
  intersectionPoint: Point | null;
};

const Drone = ({ droneSidesPoints, intersectionPoint }: Props) => {
  return (
    <polygon
      fill={intersectionPoint ? 'red' : '#32c800'}
      points={`${droneSidesPoints.map(
        ([a]) => `${a.x + GAME_FIELD_MIN_WIDTH / 2},${a.y} `,
      )}
        `}
    />
  );
};

export default Drone;
