import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import AiModelPage from './pages/AiModelPage';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai-models/:id" element={<AiModelPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;