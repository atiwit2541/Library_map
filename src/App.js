import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Rendermap from './Components/Rendermap'; // Adjust the path to the components folder


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
