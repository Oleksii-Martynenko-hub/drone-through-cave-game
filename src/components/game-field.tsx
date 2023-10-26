import { DRONE_SIDE_SIZE, GAME_FIELD_WIDTH, WALL_HEIGHT } from 'src/constants';

export type Point = {
  x: number;
  y: number;
};

interface Props {
  dronePosition: Point;
  caveWallsData: [number, number][];
}

const GameField = ({ dronePosition, caveWallsData }: Props) => {
  const wallsHeight = (caveWallsData.length - 1) * WALL_HEIGHT;
  const height = Math.min(980, wallsHeight);

  const slicedWalls = caveWallsData.slice(
    Math.floor(dronePosition.y / WALL_HEIGHT),
    height / WALL_HEIGHT + 1 + Math.floor(dronePosition.y / WALL_HEIGHT)
  );

  const lastVisibleWall = slicedWalls.at(-1) || [0, 0];

  const isLastWallDrawn =
    height / WALL_HEIGHT + 1 + Math.floor(dronePosition.y / WALL_HEIGHT) >=
    caveWallsData.length;

  const droneCenterX = GAME_FIELD_WIDTH / 2 + dronePosition.x;
  const droneSemiPerimeter = (DRONE_SIDE_SIZE * 3) / 2;
  const droneArea = Math.sqrt(
    droneSemiPerimeter * Math.pow(droneSemiPerimeter - DRONE_SIDE_SIZE, 3)
  );

  const offsetY = isLastWallDrawn ? dronePosition.y + 980 - wallsHeight : 0;

  return (
    <svg
      style={{ background: 'white' }}
      width={GAME_FIELD_WIDTH}
      height={height}
      viewBox={`0 0 ${GAME_FIELD_WIDTH} ${height}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isLastWallDrawn && (
        <line
          x1={GAME_FIELD_WIDTH / 2 + lastVisibleWall[0] - 2}
          x2={GAME_FIELD_WIDTH / 2 + lastVisibleWall[1] + 2}
          y1={height - 1 - offsetY}
          y2={height - 1 - offsetY}
          stroke="skyblue"
          strokeWidth="2"
        />
      )}
      <polygon
        fill="#646464"
        points={`0,${height} 0,${0} ${slicedWalls
          .map(
            ([left, _], i) =>
              `${GAME_FIELD_WIDTH / 2 + left},${i * WALL_HEIGHT}`
          )
          .join(' ')} ${
          GAME_FIELD_WIDTH / 2 + lastVisibleWall[0] - 2
        },${height}`}
      />
      <polygon
        fill="#646464"
        points={`${GAME_FIELD_WIDTH},${height} ${GAME_FIELD_WIDTH},${0} ${slicedWalls
          .map(
            ([_, right], i) =>
              `${GAME_FIELD_WIDTH / 2 + right},${i * WALL_HEIGHT}`
          )
          .join(' ')} ${
          GAME_FIELD_WIDTH / 2 + lastVisibleWall[1] + 2
        },${height}`}
      />
      {/* TODO: temp debug element */}
      {slicedWalls.map(([_, right], i) => (
        <circle
          key={i}
          cx={GAME_FIELD_WIDTH / 2 + right}
          cy={i * WALL_HEIGHT}
          r="1"
          stroke="red"
          fill="red"
          strokeWidth="2"
        />
      ))}
      {/* TODO: temp debug element */}
      {slicedWalls.map(([_, right], i) => (
        <text
          key={i}
          x={GAME_FIELD_WIDTH / 2 + right + 4}
          y={i * WALL_HEIGHT + 3}
          style={{ fontSize: '12px' }}
        >
          - {i + 1 + Math.floor(dronePosition.y / WALL_HEIGHT)}
        </text>
      ))}
      <polygon
        fill="green"
        points={`${droneCenterX - DRONE_SIDE_SIZE / 2},0 ${
          droneCenterX + DRONE_SIDE_SIZE / 2
        },0 ${droneCenterX},${(droneArea * 2) / DRONE_SIDE_SIZE}`}
      />
    </svg>
  );
};

export default GameField;
