
import React, { useState } from 'react';
import '../styles/configuracion.css';

function Configuracion() {
  const [configuracion, setConfiguracion] = useState({
    tema: 'claro',
    notificaciones: true,
    idioma: 'es',
    modoEstudio: 'normal'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfiguracion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="configuracion-container">
      <h2 className="configuracion-title">Configuración</h2>
      <div className="configuracion-grid">
        <div className="configuracion-card">
          <h3>Preferencias Generales</h3>
          <div className="configuracion-item">
            <label>Tema</label>
            <select
              name="tema"
              value={configuracion.tema}
              onChange={handleChange}
            >
              <option value="claro">Claro</option>
              <option value="oscuro">Oscuro</option>
            </select>
          </div>
          <div className="configuracion-item">
            <label>Idioma</label>
            <select
              name="idioma"
              value={configuracion.idioma}
              onChange={handleChange}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="configuracion-card">
          <h3>Notificaciones</h3>
          <div className="configuracion-item">
            <label>
              <input
                type="checkbox"
                name="notificaciones"
                checked={configuracion.notificaciones}
                onChange={handleChange}
              />
              Activar notificaciones
            </label>
          </div>
        </div>

        <div className="configuracion-card">
          <h3>Modo de Estudio</h3>
          <div className="configuracion-item">
            <label>Modo</label>
            <select
              name="modoEstudio"
              value={configuracion.modoEstudio}
              onChange={handleChange}
            >
              <option value="normal">Normal</option>
              <option value="concentracion">Concentración</option>
              <option value="descanso">Descanso</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuracion; 
