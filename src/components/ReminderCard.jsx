import React from 'react';

// Componente que representa una tarjeta de recordatorio
const ReminderCard = ({ recordatorio, toggleCompletado, iniciarEdicion, eliminarRecordatorio }) => {

  // Función para formatear la fecha de un recordatorio
  const formatDate = (dateString) => {
    // Convierte el string de fecha en un objeto Date
    const date = new Date(dateString);
    // Ajusta la fecha para tener en cuenta el desfase horario
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    // Retorna la fecha formateada en el formato dd/mm/yyyy
    return adjustedDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`reminder-card ${recordatorio.completado ? 'completed' : ''}`}> {/* Aplica una clase 'completed' si el recordatorio está marcado como completado */}
      
      {/* Encabezado de la tarjeta del recordatorio */}
      <div className="reminder-header">
        {/* Título del recordatorio */}
        <h3 className="reminder-title" style={{ flexGrow: 1, marginRight: '10px' }}>{recordatorio.titulo}</h3> {/* El estilo se aplica para ajustarse al diseño del layout */}
        
        {/* Botón para marcar como completado o incompleto */}
        <button
          className={`status-btn ${recordatorio.completado ? 'completed' : ''}`} // Cambia el estilo del botón según el estado de completado
          onClick={() => toggleCompletado(recordatorio.id)} // Llama a la función toggleCompletado para cambiar el estado
        >
          {recordatorio.completado ? '✓' : '○'} {/* Muestra un ícono de check o círculo según si está completado */}
        </button>
      </div>

      {/* Descripción del recordatorio */}
      <p className="reminder-description">{recordatorio.descripcion}</p>

      {/* Pie de la tarjeta del recordatorio */}
      <div className="reminder-footer">
        {/* Muestra la fecha del recordatorio */}
        <span className="reminder-date">
          📅 {formatDate(recordatorio.fecha)} {/* Muestra la fecha formateada */}
        </span>

        {/* Contenedor de botones para editar y eliminar el recordatorio */}
        <div className="button-container">
          {/* Botón para editar el recordatorio */}
          <button
            className="edit-btn"
            onClick={() => iniciarEdicion(recordatorio)} // Llama a la función iniciarEdicion con el recordatorio actual
          >
            ✏️ Editar {/* Ícono de editar */}
          </button>

          {/* Botón para eliminar el recordatorio */}
          <button
            className="delete-btn"
            onClick={() => eliminarRecordatorio(recordatorio.id)} // Llama a la función eliminarRecordatorio con el ID del recordatorio
          >
            🗑️ Eliminar {/* Ícono de eliminar */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;
