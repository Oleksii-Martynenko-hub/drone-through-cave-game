import { useEffect, useState } from 'react';
import Button from './common/button';
import Scoreboard from './scoreboard';

const Game = (props: any) => {
  const [playerId, setPlayerId] = useState<string | null>(null);

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

    if (playerId === null) fetchPlayerId();
  }, []);

  return (
    <>
      <h1>Hello {playerId || '...'}</h1>

      <Button>Play</Button>

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
    </>
  );
};

export default Game;
