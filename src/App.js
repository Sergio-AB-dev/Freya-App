import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Apuntes from './components/Notes';


function Calificaciones() {
  return <h2 style={{ color: "#f1f7fb", padding: "20px" }}>Calificaciones</h2>;
}

function Recordatorios() {
  return <h2 style={{ color: "#f1f7fb", padding: "20px" }}>Recordatorios</h2>;
}

function Configuracion() {
  return <h2 style={{ color: "#f1f7fb", padding: "20px" }}>Configuración</h2>;
}

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
