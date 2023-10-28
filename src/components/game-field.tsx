import { DRONE_SIDE_SIZE, GAME_FIELD_WIDTH, WALL_HEIGHT } from 'src/constants';

import { Point } from 'src/types/common';

import { useWindowSize } from './common/hooks/useWindowSize';

import { getTriangleHeight } from 'src/utils/get-triangle-height';
import { findLinesSegmentIntersection } from 'src/utils/find-lines-segment-intersection';

interface Props {
  dronePosition: Point;
  caveWallsData: [number, number][];
  onCrashed: () => void;
}

const GameField = ({ dronePosition, caveWallsData, onCrashed }: Props) => {
  const { height: windowHeight } = useWindowSize();

  const wallsHeight = (caveWallsData.length - 1) * WALL_HEIGHT;
  const height = Math.min(windowHeight + 20, wallsHeight);

  const slicedWalls = caveWallsData.slice(
    Math.floor(dronePosition.y / WALL_HEIGHT),
    height / WALL_HEIGHT + 1 + Math.floor(dronePosition.y / WALL_HEIGHT)
  );

  const lastVisibleWall = slicedWalls.at(-1) || [0, 0];

  const isLastWallDrawn =
    height / WALL_HEIGHT + 1 + Math.floor(dronePosition.y / WALL_HEIGHT) >=
    caveWallsData.length;

  const finishLineOffsetY = isLastWallDrawn
    ? dronePosition.y + windowHeight + 20 - wallsHeight
    : 0;
  const offsetY = dronePosition.y % WALL_HEIGHT;

  const halfDroneSide = DRONE_SIDE_SIZE / 2;

  const droneHeight = getTriangleHeight(
    DRONE_SIDE_SIZE,
    DRONE_SIDE_SIZE,
    DRONE_SIDE_SIZE
  );

  const droneSidesPoints = [
    // left side
    [
      { x: dronePosition.x - halfDroneSide, y: 0 },
      { x: dronePosition.x, y: droneHeight },
    ],
    // right side
    [
      { x: dronePosition.x, y: droneHeight },
      { x: dronePosition.x + halfDroneSide, y: 0 },
    ],
    // top side
    [
      { x: dronePosition.x + halfDroneSide, y: 0 },
      { x: dronePosition.x - halfDroneSide, y: 0 },
    ],
  ];

  const wallNumber = Math.floor(dronePosition.y / WALL_HEIGHT);

  const nearestWalls = caveWallsData.slice(wallNumber, wallNumber + 3);

  let intersectPoint: Point | null = null;

  for (let i = 0; i < 2; i++) {
    if (!nearestWalls[i + 1]) break;

    const [l1, r1] = nearestWalls[i];
    const [l2, r2] = nearestWalls[i + 1];

    const y = i * WALL_HEIGHT - offsetY;

    const leftLine = [
      { x: l1, y },
      { x: l2, y: y + WALL_HEIGHT },
    ];
    const rightLine = [
      { x: r1, y },
      { x: r2, y: y + WALL_HEIGHT },
    ];

    for (const [a, b] of [leftLine, rightLine]) {
      for (const [c, d] of droneSidesPoints) {
        const point = findLinesSegmentIntersection(a, b, c, d);

        if (point) {
          intersectPoint = { ...point };
          break;
        }
      }
    }
  }

  if (intersectPoint) {
    onCrashed();
  }

  return (
    <svg
      style={{ background: 'white' }}
      width={GAME_FIELD_WIDTH}
      height={height < 0 ? 0 : height}
      viewBox={`0 0 ${GAME_FIELD_WIDTH} ${height < 0 ? 0 : height}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isLastWallDrawn && (
        <line
          x1={GAME_FIELD_WIDTH / 2 + lastVisibleWall[0] - 2}
          x2={GAME_FIELD_WIDTH / 2 + lastVisibleWall[1] + 2}
          y1={height - 1 - finishLineOffsetY}
          y2={height - 1 - finishLineOffsetY}
          stroke="skyblue"
          strokeWidth="2"
        />
      )}
      <polygon
        fill="#646464"
        points={`0,${height} 0,${0 - offsetY} ${slicedWalls
          .map(
            ([left, _], i) =>
              `${GAME_FIELD_WIDTH / 2 + left},${i * WALL_HEIGHT - offsetY}`
          )
          .join(' ')} ${GAME_FIELD_WIDTH / 2 + lastVisibleWall[0]},${height}`}
      />
      <polygon
        fill="#646464"
        points={`${GAME_FIELD_WIDTH},${height} ${GAME_FIELD_WIDTH},${
          0 - offsetY
        } ${slicedWalls
          .map(
            ([_, right], i) =>
              `${GAME_FIELD_WIDTH / 2 + right},${i * WALL_HEIGHT - offsetY}`
          )
          .join(' ')} ${GAME_FIELD_WIDTH / 2 + lastVisibleWall[1]},${height}`}
      />
      <polygon
        fill={intersectPoint ? 'red' : 'green'}
        points={`${droneSidesPoints.map(
          ([a]) => `${a.x + GAME_FIELD_WIDTH / 2},${a.y} `
        )}
        `}
      />

      {intersectPoint && (
        <circle
          cx={intersectPoint.x + GAME_FIELD_WIDTH / 2}
          cy={intersectPoint.y}
          r="1"
          stroke="lightgreen"
          fill="yellow"
          strokeWidth="1"
        />
      )}
    </svg>
  );
};

export default GameField;
