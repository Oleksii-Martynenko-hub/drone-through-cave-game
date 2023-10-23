import { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const StyledApp = styled.div`
  min-height: 100dvh;
  min-height: 100svh;
  min-height: 100vh;
`;

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    background: rgb(100, 100, 100);
    margin: 0;
  }
`;

export function App() {
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
    <StyledApp>
      <GlobalStyle />

      <h1>Hello {playerId || '...'}</h1>
    </StyledApp>
  );
}

export default App;
