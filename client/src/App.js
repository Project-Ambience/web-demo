import React from 'react';
import styled from 'styled-components';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import GlobalStyles from './components/layout/GlobalStyles';
import ModelCataloguePage from './pages/ModelCataloguePage';
import AiModelPage from './pages/AiModelPage';
import ChatPage from './pages/ChatPage';

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
  display: flex;
`;

function App() {
  return (
    <AppContainer>
      <GlobalStyles />
      <Header />
      <MainContent>
        <Routes>
          <Route path="/" element={<ModelCataloguePage />} />
          <Route path="/ai-models/:id" element={<AiModelPage />} />
          {/* --- ADD THIS ROUTE --- */}
          {/* Using a generic /chat route for now, can be adapted */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;