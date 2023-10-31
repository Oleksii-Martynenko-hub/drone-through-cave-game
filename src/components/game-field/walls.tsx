import { GAME_FIELD_MIN_WIDTH, WALL_HEIGHT } from 'src/constants';

type Props = {
  calcHeight: number;
  slicedWalls: [number, number][];
  lastVisibleWall: [number, number];
  offsetY: number;
};

const Walls = ({
  calcHeight,
  slicedWalls,
  lastVisibleWall,
  offsetY,
}: Props) => {
  return (
    <>
      <polygon
        fill="#646464"
        points={`0,${calcHeight} 0,${0 - offsetY} ${slicedWalls
          .map(
            ([left, _], i) =>
              `${GAME_FIELD_MIN_WIDTH / 2 + left},${i * WALL_HEIGHT - offsetY}`,
          )
          .join(' ')} ${
          GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[0]
        },${calcHeight}`}
      />
      <polygon
        fill="#646464"
        points={`${GAME_FIELD_MIN_WIDTH},${calcHeight} ${GAME_FIELD_MIN_WIDTH},${
          0 - offsetY
        } ${slicedWalls
          .map(
            ([_, right], i) =>
              `${GAME_FIELD_MIN_WIDTH / 2 + right},${
                i * WALL_HEIGHT - offsetY
              }`,
          )
          .join(' ')} ${
          GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[1]
        },${calcHeight}`}
      />
    </>
  );
};

export default Walls;
