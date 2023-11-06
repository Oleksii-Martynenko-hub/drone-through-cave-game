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
  selectMaxDistance,
} from 'src/store/gameLoopSlice/gameLoop.slice';
import { selectComplexity } from 'src/store/gameSessionSlice/gameSession.slice';

import { useKeyHold } from '../common/hooks/useKeyHold';
import { useScoreBetter } from '../common/hooks/useScore';
import { useWindowSize } from '../common/hooks/useWindowSize';
import { useAnimationFrame } from '../common/hooks/useAnimationFrame';
import { useDroneSidesPoints } from '../common/hooks/useDroneSidesPoints';
import { useIntersectionPoint } from '../common/hooks/useIntersectionPoint';
import { useDeviceOrientation } from '../common/hooks/useDeviceOrientation';

import Modal from '../common/modal';
import Button from '../common/button';
import Drone from './drone';
import Walls from './walls';
import Gauges from '../gauges';
import FinishLine from './finish-line';
import IntersectionPoint from './intersection-point';

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
  const maxDistance = useAppSelector(selectMaxDistance);

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const [isFinishLineCrossed, setIsFinishLineCrossed] = useState(false);

  const [isShowRequestModal, setIsShowRequestModal] = useState(false);

  const droneSidesPoints = useDroneSidesPoints(dronePosition.x);

  const intersectionPoint = useIntersectionPoint(
    droneSidesPoints,
    caveWallsData,
    dronePosition.y,
  );

  const { score, distance } = useScoreBetter(
    caveWallsData,
    dronePosition.y,
    droneSpeed,
    gameComplexity || 0,
  );

  const { handleDeviceMotionRequest, orientation } = useDeviceOrientation(
    setIsShowRequestModal,
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

    const isFinishLineCrossed =
      dronePosition.y >= (caveWallsData.length - 1) * WALL_HEIGHT;
    setIsFinishLineCrossed(isFinishLineCrossed);
  }, [dispatch, distance, dronePosition, isRunning, score]);

  useEffect(() => {
    if (!isFinishLineCrossed && !intersectionPoint) return;

    stop();

    dispatch(gameLoopActions.setScore(score));
    dispatch(gameLoopActions.setDistance(distance));

    if (isFinishLineCrossed) {
      dispatch(gameLoopActions.setIsFinished(true));
    }

    if (intersectionPoint) {
      dispatch(gameLoopActions.setIsDroneCrashed(true));
    }
  }, [dispatch, isFinishLineCrossed, intersectionPoint]);

  const onClickRequestHandler = () => {
    setIsShowRequestModal(false);
    handleDeviceMotionRequest();
  };

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
        <Gauges
          score={score}
          progress={maxDistance ? (distance / maxDistance) * 100 : null}
          speedY={droneSpeed.y}
          speedX={droneSpeed.x}
        />

        {orientation && (
          <div style={{ color: '#000' }}>
            <h3>orientation</h3>
            <span>
              x: {Math.floor(orientation.x)}, y: {Math.floor(orientation.y)}, z:{' '}
              {Math.floor(orientation.z)}
            </span>
          </div>
        )}

        <Modal isOpen={isShowRequestModal}>
          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '6px',
            }}
          >
            <h3>Request device orientation permission</h3>
            <Button onClick={onClickRequestHandler}>Request</Button>
          </div>
        </Modal>
      </StyledGaugesWrapper>

      <svg
        style={{ background: 'white', margin: '0 auto' }}
        width={calcWidth}
        height={calcHeight < 0 ? 0 : calcHeight}
        viewBox={`${calcViewBoxX} ${0} ${viewBoxW} ${viewBoxH}`}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isLastWallDrawn && (
          <FinishLine
            lastVisibleWall={lastVisibleWall}
            finishLineOffsetY={finishLineOffsetY}
            calcHeight={calcHeight}
          />
        )}

        <Walls
          slicedWalls={slicedWalls}
          lastVisibleWall={lastVisibleWall}
          offsetY={offsetY}
          calcHeight={calcHeight}
        />

        <Drone
          droneSidesPoints={droneSidesPoints}
          intersectionPoint={intersectionPoint}
        />

        {intersectionPoint && (
          <IntersectionPoint intersectionPoint={intersectionPoint} />
        )}
      </svg>
    </StyledGameField>
  );
};

export default GameField;
