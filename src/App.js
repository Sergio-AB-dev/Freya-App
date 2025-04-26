import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Apuntes from './components/Notes';
import Calificaciones from './components/Calificaciones';
import Recordatorios from './components/Recordatorios';
import Configuracion from './components/Configuracion';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route index element={<Home />} />
        <Route path="/apuntes" element={<Apuntes />} />
        <Route path="/calificaciones" element={<Calificaciones />} />
        <Route path="/recordatorios" element={<Recordatorios />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Routes>
    </div>
  );
}

export default App;
