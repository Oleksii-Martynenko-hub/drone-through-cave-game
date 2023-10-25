import { useEffect, useState } from 'react';

import Scoreboard from './scoreboard';
import StartDialog from './start-dialog';
import Speedometer from './speedometer';
import GameField from './game-field';

const Game = (props: any) => {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [caveWallsData, setCaveWallsData] = useState<[number, number][]>([
    [-71, 71],
    [-71, 71],
    [-71, 71],
    [-70, 72],
    [-69, 72],
    [-69, 73],
    [-68, 74],
    [-67, 75],
    [-65, 76],
    [-64, 77],
  ]);

  useEffect(() => {
    const fetchPlayerId = async () => {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');

      const body = JSON.stringify({
        name: 'player1',
        complexity: 1,
      });

      const requestOptions = {
        method: 'POST',
        headers,
        body,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/init`,
        requestOptions
      )
        .then((response) => response.json())
        .catch((error) => console.log('error', error));

      setPlayerId(response.id);
      console.log('🚀 ~ fetchPlayerId ~ response.id:', response.id);
    };

    // if (playerId === null) fetchPlayerId();
  }, []);

  return (
    <>
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


      <GameField dronePosition={{ x: 0, y: 0 }} caveWallsData={caveWallsData} />
    </>
  );
};

export default Game;
