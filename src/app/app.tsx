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
  return (
    <StyledApp>
      <GlobalStyle />
    </StyledApp>
  );
}

export default App;
