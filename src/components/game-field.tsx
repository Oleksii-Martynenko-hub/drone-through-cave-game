import { useState } from 'react';

import {
  DRONE_SIDE_SIZE,
  GAME_FIELD_MAX_WIDTH,
  GAME_FIELD_MIN_WIDTH,
  WALL_HEIGHT,
} from 'src/constants';

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
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const wallsHeight = (caveWallsData.length - 1) * WALL_HEIGHT;

  const isWindowSmaller = windowWidth < GAME_FIELD_MIN_WIDTH;
  const isWindowBigger = windowWidth > GAME_FIELD_MAX_WIDTH;

  const calcWidth = isWindowSmaller
    ? GAME_FIELD_MIN_WIDTH
    : isWindowBigger
    ? GAME_FIELD_MAX_WIDTH
    : windowWidth;
  const calcHeight = Math.min(windowHeight + 20, wallsHeight);

  const ratio = calcWidth / GAME_FIELD_MIN_WIDTH;

  const viewBoxW = GAME_FIELD_MIN_WIDTH / ratio;
  const viewBoxH = calcHeight < 0 ? 0 : calcHeight / ratio;

  const [originViewBoxWidth] = useState(viewBoxW);

  const calcViewBoxX = isWindowSmaller
    ? 0
    : (originViewBoxWidth - viewBoxW) / 2;

  const slicedWalls = caveWallsData.slice(
    Math.floor(dronePosition.y / WALL_HEIGHT),
    calcHeight / WALL_HEIGHT + 1 + Math.floor(dronePosition.y / WALL_HEIGHT)
  );

  const lastVisibleWall = slicedWalls.at(-1) || [0, 0];

  const isLastWallDrawn =
    calcHeight / WALL_HEIGHT + 1 + Math.floor(dronePosition.y / WALL_HEIGHT) >=
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
      style={{ background: 'white', margin: '0 auto' }}
      width={calcWidth}
      height={calcHeight < 0 ? 0 : calcHeight}
      viewBox={`${calcViewBoxX} ${0} ${viewBoxW} ${viewBoxH}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isLastWallDrawn && (
        <line
          x1={GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[0] - 2}
          x2={GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[1] + 2}
          y1={calcHeight - 1 - finishLineOffsetY}
          y2={calcHeight - 1 - finishLineOffsetY}
          stroke="skyblue"
          strokeWidth="2"
        />
      )}
      <polygon
        fill="#646464"
        points={`0,${calcHeight} 0,${0 - offsetY} ${slicedWalls
          .map(
            ([left, _], i) =>
              `${GAME_FIELD_MIN_WIDTH / 2 + left},${i * WALL_HEIGHT - offsetY}`
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
              `${GAME_FIELD_MIN_WIDTH / 2 + right},${i * WALL_HEIGHT - offsetY}`
          )
          .join(' ')} ${
          GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[1]
        },${calcHeight}`}
      />
      <polygon
        fill={intersectPoint ? 'red' : 'green'}
        points={`${droneSidesPoints.map(
          ([a]) => `${a.x + GAME_FIELD_MIN_WIDTH / 2},${a.y} `
        )}
        `}
      />

      {intersectPoint && (
        <circle
          cx={intersectPoint.x + GAME_FIELD_MIN_WIDTH / 2}
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
