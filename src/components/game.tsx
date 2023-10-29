import { useEffect, useRef, useState } from 'react';
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

import {
  CaveWebSocket,
  getTokenByPlayerId,
  postNewPlayer,
} from 'src/api/main-api';

import { useAppDispatch, useAppSelector } from 'src/store/store';
import {
  fetchPlayerId,
  selectPlayerId,
} from 'src/store/playerId/playerId.slice';
import {
  GameSessionType,
  gameSessionActions,
  selectComplexity,
  selectName,
} from 'src/store/gameSession/gameSession.slice';

import GameField from './game-field';
import Scoreboard from './scoreboard';
import Gauges from './gauges';
import Modal from './common/modal';
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

  const [playerIdLocal, setPlayerId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const [isStartModalOpen, setIsStartModalOpen] = useState(true);

  const [caveWallsData, setCaveWallsData] = useState<[number, number][]>([]);
  const [dronePosition, setDronePosition] = useState<Point>({ x: 0, y: 0 });
  const [droneSpeed, setDroneSpeed] = useState<Point>({ x: 0, y: 0 });

  const passedWall = Math.floor(dronePosition.y / WALL_HEIGHT);
  const score = useScoreBetter(
    caveWallsData.slice(passedWall, passedWall + 1)?.[0],
    droneSpeed,
    gameComplexity || 0
  );

  const [isDroneCrashed, setIsDroneCrashed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [scoreBoardData, setScoreBoardData] = useLocalStorage<GameSession[]>(
    SCORE_BOARD_LOCAL_STORAGE_KEY,
    []
  );
  const droneSpeedRef = useRef<Point>({ x: 0, y: 0 });
  droneSpeedRef.current = droneSpeed;

  // TODO: fix multiple listeners,
  // made hook for group of keys with callback for each key
  const [isHoldKeyUp, holdKeyUpDuration] = useKeyHold(
    CONTROL_KEYS.UP,
    (duration) => {
      setDroneSpeed((prev) => {
        const newSpeedY = prev.y + (Math.floor(duration / 100) || 1);
        return {
          ...prev,
          y: newSpeedY >= DRONE_MAX_V_SPEED ? DRONE_MAX_V_SPEED : newSpeedY,
        };
      });
    }
  );
  const [isHoldKeyDown, holdKeyDownDuration] = useKeyHold(
    CONTROL_KEYS.DOWN,
    (duration) => {
      setDroneSpeed((prev) => {
        const newSpeedY = prev.y - (Math.floor(duration / 100) || 1);
        return {
          ...prev,
          y: newSpeedY <= DRONE_MIN_V_SPEED ? DRONE_MIN_V_SPEED : newSpeedY,
        };
      });
    }
  );
  const [isHoldKeyLeft, holdKeyLeftDuration] = useKeyHold(
    CONTROL_KEYS.LEFT,
    (duration) => {
      setDroneSpeed((prev) => {
        const newSpeedX = prev.x + (Math.floor(duration / 100) || 1);
        return {
          ...prev,
          x: newSpeedX >= DRONE_MAX_H_SPEED ? DRONE_MAX_H_SPEED : newSpeedX,
        };
      });
    }
  );
  const [isHoldKeyRight, holdKeyRightDuration] = useKeyHold(
    CONTROL_KEYS.RIGHT,
    (duration) => {
      setDroneSpeed((prev) => {
        const newSpeedX = prev.x - (Math.floor(duration / 100) || 1);
        return {
          ...prev,
          x: newSpeedX <= DRONE_MIN_H_SPEED ? DRONE_MIN_H_SPEED : newSpeedX,
        };
      });
    }
  );

  const [time, setTime] = useState(0); // TODO: show general spent time in end modal
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    if (token === null && playerIdLocal) {
      getTokenByPlayerId(playerIdLocal).then((value) => setToken(value || ''));
    }
  }, [playerIdLocal]);

  useEffect(() => {
    if (!playerIdLocal || !token) return;

    const ws = new CaveWebSocket(playerIdLocal, token);

    ws.connect();
    ws.open(() => setIsWebSocketConnected(true));

    ws.getCaveWallsData((wallPosition) => {
      setCaveWallsData((prev) => [...prev, wallPosition]);
    });

    return () => {
      if (ws.IsConnected) {
        ws.Socket.close();
      }
    };
  }, [playerIdLocal, token]);

  useEffect(() => {
    if (!isWebSocketConnected) return;

    run();

    return () => {
      stop();
    };
  }, [isWebSocketConnected]);

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

      if (playerName && gameComplexity && playerIdLocal) {
        setScoreBoardData((prev) => [
          ...prev,
          {
            id: playerIdLocal,
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
    setPlayerId(null);
    setToken(null);
    setIsWebSocketConnected(false);

    setCaveWallsData([]);
    setDronePosition({ x: 0, y: 0 });
    setDroneSpeed({ x: 0, y: 0 });
  };

  const handlePlayAgainBtnClick = () => {
    clearState();
    setIsDroneCrashed(false);
    setIsFinished(false);
    setIsStartModalOpen(true);
  };

  const onSubmitNewSessionData = (session: WithoutNull<GameSessionType>) => {
    setIsStartModalOpen(false);
    postNewPlayer(session).then((id) => setPlayerId(id));
    dispatch(gameSessionActions.setSession(session));
    dispatch(fetchPlayerId(session));
  };

  const onCrashed = () => setIsDroneCrashed(true);

  return (
    <StyledGame>
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

      {isWebSocketConnected && (
        <>
          <Gauges score={score} speedY={droneSpeed.y} speedX={droneSpeed.x} />

          <GameField
            dronePosition={dronePosition}
            caveWallsData={caveWallsData}
            onCrashed={onCrashed}
          />
        </>
      )}

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
