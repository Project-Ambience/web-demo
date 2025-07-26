import React from 'react';
import styled from 'styled-components';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import GlobalStyles from './components/layout/GlobalStyles';
import ModelCataloguePage from './pages/ModelCataloguePage';
import AiModelPage from './pages/AiModelPage';
import FineTunePage from './pages/FineTunePage';
import FineTuneStatusPage from './pages/FineTuneStatusPage';
import ChatPage from './pages/ChatPage';
import InterRaterPage from './pages/InterRaterPage';
import NewInferencePairPage from './pages/NewInferencePairPage';

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
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/fine-tune/:id" element={<FineTunePage />} />
          <Route path="/ai-models/:id/evaluate" element={<InterRaterPage />} />
          <Route path="/ai-models/:id/new/inference-pair" element={<NewInferencePairPage />} />
          <Route path="/fine-tune-status" element={<FineTuneStatusPage />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;
