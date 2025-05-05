// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LiveEnvironment from './pages/LiveEnvironment';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/environment/:workerId" element={<LiveEnvironment />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
