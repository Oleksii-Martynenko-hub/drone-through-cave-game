import { GAME_FIELD_MIN_WIDTH, WALL_HEIGHT } from 'src/constants';

type Props = {
  windowHeight: number;
  caveWallsData: [number, number][];
  dronePositionY: number;
};

const Walls = ({ windowHeight, caveWallsData, dronePositionY }: Props) => {
  const offsetY = dronePositionY % WALL_HEIGHT;

  const visibleWalls = caveWallsData.slice(
    Math.floor(dronePositionY / WALL_HEIGHT),
    windowHeight / WALL_HEIGHT + 1 + Math.floor(dronePositionY / WALL_HEIGHT),
  );

  const lastVisibleWall = visibleWalls.at(-1) ?? [0, 0];

  return (
    <>
      <polygon
        fill="#646464"
        points={`0,${windowHeight} 0,${0 - offsetY} ${visibleWalls
          .map(
            ([left, _], i) =>
              `${GAME_FIELD_MIN_WIDTH / 2 + left},${i * WALL_HEIGHT - offsetY}`,
          )
          .join(' ')} ${
          GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[0]
        },${windowHeight}`}
      />
      <polygon
        fill="#646464"
        points={`${GAME_FIELD_MIN_WIDTH},${windowHeight} ${GAME_FIELD_MIN_WIDTH},${
          0 - offsetY
        } ${visibleWalls
          .map(
            ([_, right], i) =>
              `${GAME_FIELD_MIN_WIDTH / 2 + right},${
                i * WALL_HEIGHT - offsetY
              }`,
          )
          .join(' ')} ${
          GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[1]
        },${windowHeight}`}
      />
    </>
  );
};

export default Walls;
