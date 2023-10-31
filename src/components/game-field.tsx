import { useEffect, useState } from 'react';

import {
  WALL_HEIGHT,
  CONTROL_KEYS,
  GAME_FIELD_MAX_WIDTH,
  GAME_FIELD_MIN_WIDTH,
} from 'src/constants';

import { useAppDispatch, useAppSelector } from 'src/store/store';
import {
  gameLoopActions,
  selectCaveWallsData,
  selectDronePosition,
  selectDroneSpeed,
} from 'src/store/gameLoopSlice/gameLoop.slice';
import { selectComplexity } from 'src/store/gameSessionSlice/gameSession.slice';

import { useKeyHold } from './common/hooks/useKeyHold';
import { useScoreBetter } from './common/hooks/useScore';
import { useWindowSize } from './common/hooks/useWindowSize';
import { useAnimationFrame } from './common/hooks/useAnimationFrame';
import { useDroneSidesPoints } from './common/hooks/useDroneSidesPoints';
import { useIntersectionPoint } from './common/hooks/useIntersectionPoint';

const GameField = () => {
  const dispatch = useAppDispatch();

  const gameComplexity = useAppSelector(selectComplexity);

  const caveWallsData = useAppSelector(selectCaveWallsData);
  const dronePosition = useAppSelector(selectDronePosition);
  const droneSpeed = useAppSelector(selectDroneSpeed);

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const droneSidesPoints = useDroneSidesPoints(dronePosition.x);

  const intersectionPoint = useIntersectionPoint(
    droneSidesPoints,
    caveWallsData,
    dronePosition.y,
  );

  //TODO: add scores to loop slice
  const score = useScoreBetter(
    caveWallsData,
    dronePosition.y,
    droneSpeed,
    gameComplexity || 0,
  );

  // TODO: fix multiple listeners,
  // made hook for group of keys with callback for each key
  const [isHoldKeyUp, holdKeyUpDuration] = useKeyHold(
    CONTROL_KEYS.UP,
    (duration) => {
      if (!isRunning) return;
      const newSpeedY = Math.floor(duration / 100) || 1;
      dispatch(gameLoopActions.setDroneSpeed({ y: newSpeedY }));
    },
  );
  const [isHoldKeyDown, holdKeyDownDuration] = useKeyHold(
    CONTROL_KEYS.DOWN,
    (duration) => {
      if (!isRunning) return;
      const newSpeedY = Math.floor(duration / 100) || 1;
      dispatch(gameLoopActions.setDroneSpeed({ y: -newSpeedY }));
    },
  );
  const [isHoldKeyLeft, holdKeyLeftDuration] = useKeyHold(
    CONTROL_KEYS.LEFT,
    (duration) => {
      if (!isRunning) return;
      const newSpeedX = Math.floor(duration / 100) || 1;
      dispatch(gameLoopActions.setDroneSpeed({ x: newSpeedX }));
    },
  );
  const [isHoldKeyRight, holdKeyRightDuration] = useKeyHold(
    CONTROL_KEYS.RIGHT,
    (duration) => {
      if (!isRunning) return;
      const newSpeedX = Math.floor(duration / 100) || 1;
      dispatch(gameLoopActions.setDroneSpeed({ x: -newSpeedX }));
    },
  );

  const { run, stop, isRunning } = useAnimationFrame((time, delta) => {
    dispatch(gameLoopActions.setDronePosition(delta));

    dispatch(gameLoopActions.setLoopTime(delta));
  });

  useEffect(() => {
    if (!isRunning) {
      run();
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const intersectFinishedLine =
      dronePosition.y >= (caveWallsData.length - 1) * WALL_HEIGHT;

    if (intersectFinishedLine && caveWallsData.length) {
      stop();

      dispatch(gameLoopActions.setIsFinished(true));
    }
  }, [dronePosition, isRunning]);

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
      stop();
      dispatch(gameLoopActions.setIsDroneCrashed(true));
    }
  }, [dispatch, intersectionPoint]);

  return (
    // TODO: add gauges to game field
    // <Gauges score={score} speedY={droneSpeed.y} speedX={droneSpeed.x} />
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
      {droneSidesPoints.length && (
        <text
          fontSize={10}
          fill="black"
          fontWeight={600}
          strokeWidth={0.3}
          stroke="white"
          x={droneSidesPoints[0][1].x + GAME_FIELD_MIN_WIDTH / 2 + 15}
          y={droneSidesPoints[0][1].y + 20}
        >
          {score}
        </text>
      )}

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
