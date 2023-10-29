import styled, { createGlobalStyle } from 'styled-components';
import { Provider } from 'react-redux';

import { store } from 'src/store/store';

import ErrorBoundary from './error-boundary';
import Game from 'src/components/game';

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
  return (
    <Provider store={store}>
      <StyledApp>
        <GlobalStyle />

        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <Game />
        </ErrorBoundary>
      </StyledApp>
    </Provider>
  );
}

export default App;
