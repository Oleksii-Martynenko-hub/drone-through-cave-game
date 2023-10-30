import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { GameSession, Point, WithoutNull } from 'src/types/common';

import {
  CONTROL_KEYS,
  DRONE_MAX_H_SPEED,
  DRONE_MAX_V_SPEED,
  DRONE_MIN_H_SPEED,
  DRONE_MIN_V_SPEED,
  SCORE_BOARD_LOCAL_STORAGE_KEY,
  WALL_HEIGHT,
} from 'src/constants';

import { CaveWebSocket } from 'src/api/cave-web-socket';

import { useAppDispatch, useAppSelector } from 'src/store/store';
import {
  fetchPlayerId,
  playerIdActions,
  selectPlayerId,
  selectPlayerIdStatus,
} from 'src/store/playerIdSlice/playerId.slice';
import {
  GameSessionType,
  gameSessionActions,
  selectComplexity,
  selectName,
} from 'src/store/gameSessionSlice/gameSession.slice';
import {
  fetchToken,
  selectToken,
  selectTokenStatus,
  tokenActions,
} from 'src/store/tokenSlice/token.slice';
import {
  gameLoopActions,
  selectIsDroneCrashed,
} from 'src/store/gameLoopSlice/gameLoop.slice';

import Gauges from './gauges';
import GameField from './game-field';
import Scoreboard from './scoreboard';
import Modal from './common/modal';
import Loader from './common/loader';
import Button from './common/button';
import NewSessionForm from './common/new-session-form';

import { useKeyHold } from './common/hooks/useKeyHold';
import { useScoreBetter } from './common/hooks/useScore';
import { useLocalStorage } from './common/hooks/useLocalStorage';
import { useAnimationFrame } from './common/hooks/useAnimationFrame';

const StyledGame = styled.div`
  display: flex;
  align-items: start;
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
`;

const StartModelContent = styled.div`
  background-color: #646464;
  padding: 26px;
  border-radius: 6px;
`;

const EndModelContent = styled(StartModelContent)`
  color: #f3f3f3;
`;

const Game = (props: any) => {
  const dispatch = useAppDispatch();

  const playerId = useAppSelector(selectPlayerId);
  const playerName = useAppSelector(selectName);
  const gameComplexity = useAppSelector(selectComplexity);
  const token = useAppSelector(selectToken);

  const playerIdStatus = useAppSelector(selectPlayerIdStatus);
  const tokenStatus = useAppSelector(selectTokenStatus);
  const isDroneCrashed = useAppSelector(selectIsDroneCrashed);

  const [caveWebSocket, setCaveWebSocket] = useState<CaveWebSocket | null>(
    null,
  );

  const [isStartModalOpen, setIsStartModalOpen] = useState(true);
  const [isGameDataLoading, setIsGameDataLoading] = useState(false);
  const [isEnoughWallsLoaded, setIsEnoughWallsLoaded] = useState(false);
  const isEnoughWallsLoadedRef = useRef(false);
  isEnoughWallsLoadedRef.current = isEnoughWallsLoaded;

  const [caveWallsData, setCaveWallsData] = useState<[number, number][]>([]);
  const [dronePosition, setDronePosition] = useState<Point>({ x: 0, y: 0 });
  const [droneSpeed, setDroneSpeed] = useState<Point>({ x: 0, y: 0 });

  const passedWall = Math.floor(dronePosition.y / WALL_HEIGHT);
  const score = useScoreBetter(
    caveWallsData.slice(passedWall, passedWall + 1)?.[0],
    droneSpeed,
    gameComplexity || 0,
  );

  const [isFinished, setIsFinished] = useState(false);

  const [scoreBoardData, setScoreBoardData] = useLocalStorage<GameSession[]>(
    SCORE_BOARD_LOCAL_STORAGE_KEY,
    [],
  );
  const droneSpeedRef = useRef<Point>({ x: 0, y: 0 });
  droneSpeedRef.current = droneSpeed;

  // TODO: fix multiple listeners,
  // made hook for group of keys with callback for each key
  const [isHoldKeyUp, holdKeyUpDuration] = useKeyHold(
    CONTROL_KEYS.UP,
    (duration) => {
      if (!isEnoughWallsLoadedRef.current) return;

      setDroneSpeed((prev) => {
        const newSpeedY = prev.y + (Math.floor(duration / 100) || 1);
        return {
          ...prev,
          y: newSpeedY >= DRONE_MAX_V_SPEED ? DRONE_MAX_V_SPEED : newSpeedY,
        };
      });
    },
  );
  const [isHoldKeyDown, holdKeyDownDuration] = useKeyHold(
    CONTROL_KEYS.DOWN,
    (duration) => {
      if (!isEnoughWallsLoadedRef.current) return;

      setDroneSpeed((prev) => {
        const newSpeedY = prev.y - (Math.floor(duration / 100) || 1);
        return {
          ...prev,
          y: newSpeedY <= DRONE_MIN_V_SPEED ? DRONE_MIN_V_SPEED : newSpeedY,
        };
      });
    },
  );
  const [isHoldKeyLeft, holdKeyLeftDuration] = useKeyHold(
    CONTROL_KEYS.LEFT,
    (duration) => {
      if (!isEnoughWallsLoadedRef.current) return;

      setDroneSpeed((prev) => {
        const newSpeedX = prev.x + (Math.floor(duration / 100) || 1);
        return {
          ...prev,
          x: newSpeedX >= DRONE_MAX_H_SPEED ? DRONE_MAX_H_SPEED : newSpeedX,
        };
      });
    },
  );
  const [isHoldKeyRight, holdKeyRightDuration] = useKeyHold(
    CONTROL_KEYS.RIGHT,
    (duration) => {
      if (!isEnoughWallsLoadedRef.current) return;

      setDroneSpeed((prev) => {
        const newSpeedX = prev.x - (Math.floor(duration / 100) || 1);
        return {
          ...prev,
          x: newSpeedX <= DRONE_MIN_H_SPEED ? DRONE_MIN_H_SPEED : newSpeedX,
        };
      });
    },
  );

  const [time, setTime] = useState(0); // TODO: show general spent time in end modal
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    if (!isGameDataLoading || !isEnoughWallsLoaded) return;

    const isDataLoaded = [playerIdStatus, tokenStatus].every((status) => {
      return status !== 'not loaded' && status !== 'loading';
    });

    if (isDataLoaded) {
      setIsGameDataLoading(false);
    }
  }, [isGameDataLoading, playerIdStatus, tokenStatus, isEnoughWallsLoaded]);

  useLayoutEffect(() => {
    if (!caveWebSocket) {
      setCaveWebSocket(new CaveWebSocket());
    }
  }, []);

  useEffect(() => {
    if (token === null && playerId) {
      dispatch(fetchToken(playerId));
    }
  }, [playerId]);

  useEffect(() => {
    if (!playerId || !token || !caveWebSocket) return;

    caveWebSocket.connect();
    caveWebSocket.open(playerId, token);
    caveWebSocket.resetWindowHeight();

    caveWebSocket.getCaveWallsData(
      (wallPositions) => {
        setCaveWallsData([...wallPositions]);
        setIsEnoughWallsLoaded(true);
      },
      (additionalWallPositions) => {
        setCaveWallsData([...additionalWallPositions]);
      },
    );

    return () => {
      if (caveWebSocket.IsConnected) {
        caveWebSocket.Socket.close();
      }
    };
  }, [playerId, token, caveWebSocket]);

  useEffect(() => {
    if (!isEnoughWallsLoaded || isGameDataLoading) return;

    run();

    return () => {
      stop();
    };
  }, [isEnoughWallsLoaded, isGameDataLoading]);

  const { run, stop, isRunning } = useAnimationFrame((time, delta) => {
    const { x, y } = droneSpeedRef.current;

    if (x || y) {
      const newPositionY = (y * delta) / 1000;
      const newPositionX = (x * delta) / 1000;

      setDronePosition((prev) => ({
        x: prev.x + newPositionX,
        y: prev.y + newPositionY,
      }));
    }

    setTime(time);
    setDelta(delta);
  });

  useEffect(() => {
    if (!isRunning) return;

    const intersectFinishedLine =
      dronePosition.y >= (caveWallsData.length - 1) * WALL_HEIGHT;

    if (intersectFinishedLine && caveWallsData.length) {
      stop();

      if (playerName && gameComplexity && playerId) {
        setScoreBoardData((prev) => [
          ...prev,
          {
            id: playerId,
            name: playerName,
            difficulty: gameComplexity,
            score,
          },
        ]);
        setIsFinished(true);
      }
    }
  }, [dronePosition, isRunning]);

  useEffect(() => {
    if (isDroneCrashed) {
      stop();
    }
  }, [isDroneCrashed]);

  const clearState = () => {
    dispatch(playerIdActions.clear());
    dispatch(tokenActions.clear());
    setIsEnoughWallsLoaded(false);
    caveWebSocket?.clearData();

    setCaveWallsData([]);
    setDronePosition({ x: 0, y: 0 });
    setDroneSpeed({ x: 0, y: 0 });
  };

  const handlePlayAgainBtnClick = () => {
    clearState();
    dispatch(gameLoopActions.clear());
    setIsFinished(false);
    setIsStartModalOpen(true);
  };

  // TODO: move to form component
  const onSubmitNewSessionData = (session: WithoutNull<GameSessionType>) => {
    dispatch(gameSessionActions.setSession(session));
    dispatch(fetchPlayerId(session));

    setIsGameDataLoading(true);
    setIsStartModalOpen(false);
  };

  if (isGameDataLoading)
    return (
      <LoaderWrapper>
        <Loader />
        <h3>Loading game data...</h3>
      </LoaderWrapper>
    );

  return (
    <StyledGame>
      {/* TODO: move to separated component */}
      <Modal isOpen={isStartModalOpen}>
        <StartModelContent>
          <NewSessionForm
            initData={{ name: playerName, complexity: gameComplexity }}
            onSubmit={onSubmitNewSessionData}
          />

          {Boolean(scoreBoardData.length) && (
            <Scoreboard scoreboardData={scoreBoardData} />
          )}
        </StartModelContent>
      </Modal>

      {/* TODO: move to separated component, show when enough walls loaded */}
      {isEnoughWallsLoaded && (
        <>
          <Gauges score={score} speedY={droneSpeed.y} speedX={droneSpeed.x} />

          <GameField
            dronePosition={dronePosition}
            caveWallsData={caveWallsData}
          />
        </>
      )}

      {/* TODO: move to separated component */}
      <Modal isOpen={isDroneCrashed || isFinished}>
        <StartModelContent>
          <EndModelContent>
            <h3>
              {isFinished
                ? 'Congratulations!'
                : 'The drone has been destroyed...'}
            </h3>
            <p>name: {playerName}</p>
            <p>difficulty: {gameComplexity}</p>
            <p>score: {score}</p>

            <Button onClick={handlePlayAgainBtnClick}>Play again</Button>
          </EndModelContent>
        </StartModelContent>
      </Modal>
    </StyledGame>
  );
};

export default Game;
