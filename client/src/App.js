// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Header from './components/layout/Header';
// import HomePage from './pages/HomePage';
// import AiModelPage from './pages/AiModelPage';

// function App() {
//   return (
//     <>
//       <Header />
//       <main>
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/ai-models/:id" element={<AiModelPage />} />
//         </Routes>
//       </main>
//     </>
//   );
// }

// export default App;

import React from 'react';
import styled from 'styled-components';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import GlobalStyles from './components/layout/GlobalStyles';
import ModelCataloguePage from './pages/ModelCataloguePage';
import AiModelPage from './pages/AiModelPage';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  /* --- FIX IS HERE --- */
  /* This ensures the main content area can expand and allows the grid to work correctly. */
  display: flex;
`;

function App() {
  return (
    <AppContainer>
      {/* No Router here, as it's correctly placed in index.js */}
      <GlobalStyles />
      <Header />
      <MainContent>
        <Routes>
          <Route path="/" element={<ModelCataloguePage />} />
          <Route path="/ai-models/:id" element={<AiModelPage />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;