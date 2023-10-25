import { useEffect, useRef, useState } from 'react';

import Scoreboard from './scoreboard';
import StartDialog from './start-dialog';
import Speedometer from './speedometer';
import GameField, { Point } from './game-field';
import { useAnimationFrame } from './common/hooks/useAnimationFrame';
import styled from 'styled-components';

const StyledGame = styled.div`
  display: flex;
`;

const Game = (props: any) => {
  const [playerId, setPlayerId] = useState<string | null>(null);

  const [caveWallsData, setCaveWallsData] = useState<[number, number][]>([]);
  const [dronePosition, setDronePosition] = useState<Point>({ x: 0, y: 0 });
  const [droneSpeed, setDroneSpeed] = useState<Point>({ x: 0, y: 0 });
  const droneSpeedRef = useRef<Point>({ x: 0, y: 0 });

  droneSpeedRef.current = droneSpeed;


  const [time, setTime] = useState(0);
  const [delta, setDelta] = useState(0);


  useEffect(() => {
    if (!playerId || !token) return;
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
      <Speedometer speedY={droneSpeed.y} speedX={droneSpeed.x} />
        <GameField
          dronePosition={dronePosition}
          caveWallsData={caveWallsData}
        />
    </StyledGame>
  );
};

export default Game;
