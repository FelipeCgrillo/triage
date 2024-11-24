import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Consulta from './Consulta';
import './App.css';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/consulta" element={<Consulta />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App; 