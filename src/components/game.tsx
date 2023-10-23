import { useEffect, useState } from 'react';

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

  return <h1>Hello {playerId || '...'}</h1>;
};

export default Game;
