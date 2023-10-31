import styled, { createGlobalStyle } from 'styled-components';

import { useAppSelector } from 'src/store/store';
import { selectIsEnoughWallsLoaded } from 'src/store/gameLoopSlice/gameLoop.slice';

import ErrorBoundary from './error-boundary';
import Game from 'src/components/game';
import GameField from 'src/components/game-field/game-field';

import 'normalize.css';

const StyledApp = styled.div`
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
`;

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Courier New', Courier, monospace;
    background: #646464;
    overflow: hidden;
  }
`;

export function App() {
  const isEnoughWallsLoaded = useAppSelector(selectIsEnoughWallsLoaded);

  return (
    <StyledApp>
      <GlobalStyle />

      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <Game />

        {isEnoughWallsLoaded && <GameField />}
      </ErrorBoundary>
    </StyledApp>
  );
}

export default App;
