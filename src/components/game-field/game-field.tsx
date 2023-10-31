import { useEffect, useState } from 'react';
import styled from 'styled-components';

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
  selectLoopTime,
} from 'src/store/gameLoopSlice/gameLoop.slice';
import { selectComplexity } from 'src/store/gameSessionSlice/gameSession.slice';

import { useKeyHold } from '../common/hooks/useKeyHold';
import { useScoreBetter } from '../common/hooks/useScore';
import { useWindowSize } from '../common/hooks/useWindowSize';
import { useAnimationFrame } from '../common/hooks/useAnimationFrame';
import { useDroneSidesPoints } from '../common/hooks/useDroneSidesPoints';
import { useIntersectionPoint } from '../common/hooks/useIntersectionPoint';

import Gauges from '../gauges';

const StyledGameField = styled.div`
  position: relative;
`;

const StyledGaugesWrapper = styled.div`
  position: absolute;
`;

const GameField = () => {
  const dispatch = useAppDispatch();

  const gameComplexity = useAppSelector(selectComplexity);

  const caveWallsData = useAppSelector(selectCaveWallsData);
  const dronePosition = useAppSelector(selectDronePosition);
  const droneSpeed = useAppSelector(selectDroneSpeed);
  const loopTime = useAppSelector(selectLoopTime);

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const droneSidesPoints = useDroneSidesPoints(dronePosition.x);

  const intersectionPoint = useIntersectionPoint(
    droneSidesPoints,
    caveWallsData,
    dronePosition.y,
  );

  const score = useScoreBetter(
    caveWallsData,
    dronePosition.y,
    droneSpeed,
    gameComplexity || 0,
  );

  const keyHoldCallback =
    (key: string) => (duration: number, isFirstCall: boolean) => {
      if (!isRunning) return;

      const axis =
        key == CONTROL_KEYS.UP || key == CONTROL_KEYS.DOWN ? 'y' : 'x';
      const trend = key == CONTROL_KEYS.UP || key == CONTROL_KEYS.LEFT ? 1 : -1;

      const additionalSpeed = isFirstCall
        ? 1
        : duration > 200
        ? Math.floor(duration / 200)
        : duration > 100
        ? 1
        : 0;

      dispatch(
        gameLoopActions.setDroneSpeed({ [axis]: trend * additionalSpeed }),
      );
    };

  useKeyHold(
    {
      [CONTROL_KEYS.UP]: keyHoldCallback(CONTROL_KEYS.UP),
      [CONTROL_KEYS.DOWN]: keyHoldCallback(CONTROL_KEYS.DOWN),
      [CONTROL_KEYS.LEFT]: keyHoldCallback(CONTROL_KEYS.LEFT),
      [CONTROL_KEYS.RIGHT]: keyHoldCallback(CONTROL_KEYS.RIGHT),
    },
    [loopTime],
  );

  const { run, stop, isRunning } = useAnimationFrame((time, delta) => {
    dispatch(gameLoopActions.setDronePosition({ delta }));

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

      dispatch(gameLoopActions.setScore(score));
      dispatch(gameLoopActions.setIsFinished(true));
    }
  }, [dronePosition, isRunning]);

  useEffect(() => {
    if (intersectionPoint) {
      stop();

      dispatch(gameLoopActions.setScore(score));
      dispatch(gameLoopActions.setIsDroneCrashed(true));
    }
  }, [dispatch, intersectionPoint]);

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

  return (
    <StyledGameField>
      <StyledGaugesWrapper>
        <Gauges score={score} speedY={droneSpeed.y} speedX={droneSpeed.x} />
      </StyledGaugesWrapper>

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
                `${GAME_FIELD_MIN_WIDTH / 2 + left},${
                  i * WALL_HEIGHT - offsetY
                }`,
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
    </StyledGameField>
  );
};

export default GameField;
