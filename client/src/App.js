import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AiModelPage from './pages/AiModelPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Project Ambience</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai-models/:id" element={<AiModelPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;