import styled, { createGlobalStyle } from 'styled-components';

import ErrorBoundary from './error-boundary';
import Game from 'src/components/game';

import 'normalize.css';

const StyledApp = styled.div``;

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
  return (
    <StyledApp>
      <GlobalStyle />

      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <Game />
      </ErrorBoundary>
    </StyledApp>
  );
}

export default App;
