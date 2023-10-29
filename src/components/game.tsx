import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { GameSession, NewSessionData, Point } from 'src/types/common';

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
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const [isStartModalOpen, setIsStartModalOpen] = useState(true);

  const [caveWallsData, setCaveWallsData] = useState<[number, number][]>([]);
  const [dronePosition, setDronePosition] = useState<Point>({ x: 0, y: 0 });
  const [droneSpeed, setDroneSpeed] = useState<Point>({ x: 0, y: 0 });

  const [session, setSession] = useState<NewSessionData | null>(null);
  const passedWall = Math.floor(dronePosition.y / WALL_HEIGHT);
  const score = useScoreBetter(
    caveWallsData.slice(passedWall, passedWall + 1)?.[0],
    droneSpeed,
    session?.difficulty || 0
  );

  const [isDroneCrashed, setIsDroneCrashed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [scoreBoardData, setScoreBoardData] = useLocalStorage<GameSession[]>(
    SCORE_BOARD_LOCAL_STORAGE_KEY,
    []
  );
  const droneSpeedRef = useRef<Point>({ x: 0, y: 0 });
  droneSpeedRef.current = droneSpeed;

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

  const [time, setTime] = useState(0);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    if (token === null && playerId) {
      getTokenByPlayerId(playerId).then((value) => setToken(value || ''));
    }
  }, [playerId]);

  useEffect(() => {
    if (!playerId || !token) return;

    const ws = new CaveWebSocket(playerId, token);

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
  }, [playerId, token]);

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

      if (session && playerId) {
        setScoreBoardData((prev) => [
          ...prev,
          {
            id: playerId,
            name: session.name,
            difficulty: session.difficulty,
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

    setSession(null);
  };

  const handlePlayAgainBtnClick = () => {
    clearState();
    setIsDroneCrashed(false);
    setIsFinished(false);
    setIsStartModalOpen(true);
  };

  const onSubmitNewSessionData = ({ name, difficulty }: NewSessionData) => {
    setSession({ name, difficulty });
    setIsStartModalOpen(false);
    postNewPlayer({ name, complexity: difficulty }).then((id) =>
      setPlayerId(id)
    );
  };

  const onCrashed = () => setIsDroneCrashed(true);

  return (
    <StyledGame>
      <Modal isOpen={isStartModalOpen}>
        <StartModelContent>
          <NewSessionForm onSubmit={onSubmitNewSessionData} />

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
            <p>name: {session?.name}</p>
            <p>difficulty: {session?.difficulty}</p>
            <p>score: {score}</p>

            <Button onClick={handlePlayAgainBtnClick}>Play again</Button>
          </EndModelContent>
        </StartModelContent>
      </Modal>
    </StyledGame>
  );
};

export default Game;
