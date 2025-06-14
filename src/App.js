import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Rendermap from './Components/Rendermap';

function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<Navigate to="/rendermap" replace />} />
        <Route path="/rendermap" element={<Rendermap />} />
      </Routes>
    </Router> 
  );
}

export default App;