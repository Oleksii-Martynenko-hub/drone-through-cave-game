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
import Speedometer from './speedometer';
import StartDialog from './start-dialog';
import NewSessionForm from './common/new-session-form';

import { useKeyHold } from './common/hooks/useKeyHold';
import { useScoreBetter } from './common/hooks/useScore';
import { useLocalStorage } from './common/hooks/useLocalStorage';
import { useAnimationFrame } from './common/hooks/useAnimationFrame';

const StyledGame = styled.div`
  display: flex;
`;



const Game = (props: any) => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const [isOpen, setIsOpen] = useState(true);

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
      alert('congratulations');

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
      }
    }
  }, [dronePosition, isRunning]);

  useEffect(() => {
    if (isDroneCrashed) {
      stop();
      alert('the drone has been destroyed');
    }
  }, [isDroneCrashed]);

  const onSubmitNewSessionData = (sessionData: NewSessionData) => {
    setSession(sessionData);
    setIsOpen(false);
    postNewPlayer(sessionData).then((id) => setPlayerId(id));
  };

  const onCrashed = () => setIsDroneCrashed(true);

  return (
    <StyledGame>
      <StartDialog isOpen={isOpen}>
        <NewSessionForm onSubmit={onSubmitNewSessionData} />

        <Scoreboard scoreboardData={scoreBoardData} />
      </StartDialog>

      {isWebSocketConnected && (
        <>
          <Speedometer speedY={droneSpeed.y} speedX={droneSpeed.x} />

          <GameField
            dronePosition={dronePosition}
            caveWallsData={caveWallsData}
            onCrashed={onCrashed}
          />

          <div>
            <div>
              <span>score: {score}</span>
            </div>
            <div>
              <span>KeyUp: {isHoldKeyUp && 'hold '}</span>
              <span> duration: {holdKeyUpDuration}</span>
            </div>
            <div>
              <span>KeyLeft: {isHoldKeyLeft && 'hold '}</span>
              <span> duration: {holdKeyLeftDuration}</span>
            </div>
            <div>
              <span>KeyRight: {isHoldKeyRight && 'hold '}</span>
              <span> duration: {holdKeyRightDuration}</span>
            </div>
            <div>
              <span>KeyDown: {isHoldKeyDown && 'hold '}</span>
              <span> duration: {holdKeyDownDuration}</span>
            </div>
          </div>
        </>
      )}
    </StyledGame>
  );
};

export default Game;
