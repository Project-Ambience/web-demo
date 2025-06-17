import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f4f7f6;
    color: #333;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1, h2, h3 {
    color: #2c3e50;
  }

  a {
    text-decoration: none;
    color: #2980b9;
    font-weight: bold;
  }

  a:hover {
    text-decoration: underline;
  }
`;

export default GlobalStyles;