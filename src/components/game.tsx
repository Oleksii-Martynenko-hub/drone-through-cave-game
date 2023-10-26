import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import {
  CONTROL_KEYS,
  DRONE_MAX_H_SPEED,
  DRONE_MAX_V_SPEED,
  DRONE_MIN_H_SPEED,
  DRONE_MIN_V_SPEED,
} from 'src/constants';

import {
  CaveWebSocket,
  getTokenByPlayerId,
  postNewPlayer,
} from 'src/api/main-api';

import Scoreboard from './scoreboard';
import StartDialog from './start-dialog';
import Speedometer from './speedometer';
import GameField, { Point } from './game-field';

import { useAnimationFrame } from './common/hooks/useAnimationFrame';
import { useKeyHold } from './common/hooks/useKeyHold';

const StyledGame = styled.div`
  display: flex;
`;



const Game = (props: any) => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const [caveWallsData, setCaveWallsData] = useState<[number, number][]>([]);
  const [dronePosition, setDronePosition] = useState<Point>({ x: 0, y: 0 });
  const [droneSpeed, setDroneSpeed] = useState<Point>({ x: 0, y: 0 });

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
    if (playerId === null) {
      postNewPlayer({ name: 'player1' }).then((id) => setPlayerId(id));
    }

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
    if (!isWebSocketConnected) return;

    run();

    return () => {
      stop();
    };
  }, [isWebSocketConnected]);

  return (
    <StyledGame>
      {/* <StartDialog>
        <Scoreboard
          scoreboardData={[
            { id: 1, name: 'John', difficulty: 1, score: 10 },
            { id: 2, name: 'Mary', difficulty: 2, score: 20 },
            { id: 3, name: 'Peter', difficulty: 3, score: 30 },
            { id: 4, name: 'Jane', difficulty: 4, score: 40 },
            { id: 5, name: 'Mark', difficulty: 5, score: 50 },
            { id: 6, name: 'Lisa', difficulty: 6, score: 60 },
          ]}
        />

        <Speedometer speedY={78} speedX={-30} />
      </StartDialog> */}
      
      {isWebSocketConnected && (
        <>
          <Speedometer speedY={droneSpeed.y} speedX={droneSpeed.x} />

          <GameField
            dronePosition={dronePosition}
            caveWallsData={caveWallsData}
          />

          <div>
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
