import { useEffect, useState } from 'react';

import {
  GAME_FIELD_MAX_WIDTH,
  GAME_FIELD_MIN_WIDTH,
  WALL_HEIGHT,
} from 'src/constants';

import { Point } from 'src/types/common';

import { useWindowSize } from './common/hooks/useWindowSize';
import { useDroneSidesPoints } from './common/hooks/useDroneSidesPoints';
import { useIntersectionPoint } from './common/hooks/useIntersectionPoint';

import { useAppDispatch } from 'src/store/store';
import { gameLoopActions } from 'src/store/gameLoopSlice/gameLoop.slice';

interface Props {
  dronePosition: Point;
  caveWallsData: [number, number][];
}

const GameField = ({ dronePosition, caveWallsData }: Props) => {
  const dispatch = useAppDispatch();

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const droneSidesPoints = useDroneSidesPoints(dronePosition.x);

  const intersectionPoint = useIntersectionPoint(
    droneSidesPoints,
    caveWallsData,
    dronePosition.y,
  );

  const offsetY = dronePosition.y % WALL_HEIGHT;

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
    calcHeight / WALL_HEIGHT + 1 + Math.floor(dronePosition.y / WALL_HEIGHT),
  );

  const lastVisibleWall = slicedWalls.at(-1) || [0, 0];

  const isLastWallDrawn =
    calcHeight / WALL_HEIGHT + 1 + Math.floor(dronePosition.y / WALL_HEIGHT) >=
    caveWallsData.length;

  const finishLineOffsetY = isLastWallDrawn
    ? dronePosition.y + windowHeight + 20 - wallsHeight
    : 0;

  useEffect(() => {
    if (intersectionPoint) {
      dispatch(gameLoopActions.setIsDroneCrashed(true));
    }
  }, [dispatch, intersectionPoint]);

  return (
    <svg
      style={{ background: 'white', margin: '0 auto' }}
      width={calcWidth}
      height={calcHeight < 0 ? 0 : calcHeight}
      viewBox={`${calcViewBoxX} ${0} ${viewBoxW} ${viewBoxH}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* TODO: move to separated component */}
      {isLastWallDrawn && (
        <line
          x1={GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[0] - 2}
          x2={GAME_FIELD_MIN_WIDTH / 2 + lastVisibleWall[1] + 2}
          y1={calcHeight - 1 - finishLineOffsetY}
          y2={calcHeight - 1 - finishLineOffsetY}
          stroke="#4fccff"
          strokeWidth="2"
        />
      )}
      {/* TODO: move to separated component */}
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
      {/* TODO: move to separated component */}
      <polygon
        fill={intersectionPoint ? 'red' : '#32c800'}
        points={`${droneSidesPoints.map(
          ([a]) => `${a.x + GAME_FIELD_MIN_WIDTH / 2},${a.y} `,
        )}
        `}
      />

      {/* TODO: move to separated component */}
      {intersectionPoint && (
        <circle
          cx={intersectionPoint.x + GAME_FIELD_MIN_WIDTH / 2}
          cy={intersectionPoint.y}
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
