import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../styles/recordatorios.css';
import ReminderCard from './ReminderCard';
import { db } from '../firebase'; // Importa la instancia de Firestore
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

function Recordatorios() {
  // Estado que mantiene la lista de recordatorios
  const [recordatorios, setRecordatorios] = useState([]);
  // Estado para el nuevo recordatorio (título, descripción, fecha)
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
  });
  // Estado para manejar si estamos editando un recordatorio
  const [editando, setEditando] = useState(null);
  // Estado para mostrar u ocultar el formulario de agregar un nuevo recordatorio
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  // Estado para mostrar el modal de edición
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  // Referencia a la colección de Firestore donde se guardan los recordatorios
  const recordatoriosCollectionRef = collection(db, 'recordatorios');

  useEffect(() => {
    // Configura un "listener" para escuchar cambios en tiempo real en la colección de Firestore
    const unsubscribe = onSnapshot(recordatoriosCollectionRef, (snapshot) => {
      const recordatoriosDesdeFirestore = [];
      snapshot.forEach((doc) => {
        // Añadimos cada documento a la lista de recordatorios
        recordatoriosDesdeFirestore.push({ id: doc.id, ...doc.data() });
      });
      // Actualizamos el estado con la lista de recordatorios obtenida
      setRecordatorios(recordatoriosDesdeFirestore);
    });

    return () => unsubscribe(); // Limpiar el "listener" al desmontar el componente
  }, [recordatoriosCollectionRef]); // Dependencia de useEffect: se activa cuando cambia la referencia a la colección

  // Función para cambiar el estado de completado de un recordatorio (marcar como completado o no completado)
  const toggleCompletado = async (id) => {
    const recordatorioDocRef = doc(recordatoriosCollectionRef, id);
    const recordatorio = recordatorios.find((r) => r.id === id); // Buscar el recordatorio por id
    if (recordatorio) {
      try {
        // Actualizamos el estado de "completado" en Firestore
        await updateDoc(recordatorioDocRef, { completado: !recordatorio.completado });
      } catch (error) {
        // Manejo de errores si no se pudo actualizar el estado
        console.error('Error al actualizar el estado de completado:', error);
        Swal.fire('Error', 'No se pudo actualizar el recordatorio.', 'error');
      }
    }
  };

  // Función para agregar un nuevo recordatorio
  const agregarRecordatorio = async () => {
    // Verificar si todos los campos necesarios están completos
    if (!nuevoRecordatorio.titulo || !nuevoRecordatorio.descripcion || !nuevoRecordatorio.fecha) {
      Swal.fire({
        title: 'Campos requeridos',
        html: `Por favor completa todos los campos obligatorios: <br><br>
                  ${!nuevoRecordatorio.titulo ? '• <b>Título</b><br>' : ''}
                  ${!nuevoRecordatorio.descripcion ? '• <b>Descripción</b><br>' : ''}
                  ${!nuevoRecordatorio.fecha ? '• <b>Fecha</b>' : ''}`,
        icon: 'error',
        confirmButtonColor: '#5f8cff',
      });
      return; // No agregar el recordatorio si falta algún campo
    }

    try {
      // Agregar el nuevo recordatorio a Firestore
      await addDoc(recordatoriosCollectionRef, { ...nuevoRecordatorio, completado: false });
      Swal.fire('¡Éxito!', 'Recordatorio agregado correctamente', 'success');
      // Limpiar el formulario y ocultar el formulario de agregar
      setNuevoRecordatorio({ titulo: '', descripcion: '', fecha: '' });
      setMostrarFormulario(false);
    } catch (error) {
      // Manejo de errores si no se pudo agregar el recordatorio
      console.error('Error al agregar recordatorio:', error);
      Swal.fire('Error', 'No se pudo agregar el recordatorio.', 'error');
    }
  };

  // Función para eliminar un recordatorio
  const eliminarRecordatorio = async (id) => {
    // Confirmación antes de eliminar
    Swal.fire({
      title: '¿Eliminar recordatorio?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5f8cff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const recordatorioDocRef = doc(recordatoriosCollectionRef, id);
          await deleteDoc(recordatorioDocRef); // Eliminar el recordatorio en Firestore
          Swal.fire('Eliminado!', 'El recordatorio ha sido eliminado.', 'success');
        } catch (error) {
          // Manejo de errores si no se pudo eliminar
          console.error('Error al eliminar recordatorio:', error);
          Swal.fire('Error', 'No se pudo eliminar el recordatorio.', 'error');
        }
      }
    });
  };

  // Función para iniciar la edición de un recordatorio
  const iniciarEdicion = (recordatorio) => {
    const fechaParaEditar = recordatorio.fecha.includes('T')
      ? recordatorio.fecha.split('T')[0] // Formateamos la fecha si contiene 'T'
      : recordatorio.fecha;

    setEditando({ ...recordatorio, fecha: fechaParaEditar }); // Establecer el recordatorio a editar
    setMostrarModalEdicion(true); // Mostrar el modal de edición
  };

  // Función para guardar los cambios al editar un recordatorio
  const guardarEdicion = async () => {
    // Verificar si todos los campos necesarios están completos
    if (!editando?.titulo || !editando?.descripcion || !editando?.fecha) {
      Swal.fire({
        title: 'Campos requeridos',
        html: `Por favor completa todos los campos obligatorios: <br><br>
                  ${!editando?.titulo ? '• <b>Título</b><br>' : ''}
                  ${!editando?.descripcion ? '• <b>Descripción</b><br>' : ''}
                  ${!editando?.fecha ? '• <b>Fecha</b>' : ''}`,
        icon: 'error',
        confirmButtonColor: '#5f8cff',
      });
      return; // No guardar si falta algún campo
    }

    try {
      const recordatorioDocRef = doc(recordatoriosCollectionRef, editando.id);
      const { id, ...datosAActualizar } = editando; // Excluye el ID de los datos a actualizar
      await updateDoc(recordatorioDocRef, datosAActualizar); // Actualizar el recordatorio en Firestore
      Swal.fire('¡Actualizado!', 'Recordatorio modificado correctamente', 'success');
      setMostrarModalEdicion(false); // Cerrar el modal de edición
      setEditando(null); // Limpiar el estado de edición
    } catch (error) {
      // Manejo de errores si no se pudo guardar la edición
      console.error('Error al guardar edición:', error);
      Swal.fire('Error', 'No se pudo guardar la edición.', 'error');
    }
  };

  return (
    <div className="app-container">
      <h1 className="main-title-outside">Mis Recordatorios</h1>
      <div className="main-card">
        <div className="main-card-header">
          <div className="add-button-container">
            <button
              className="add-button"
              onClick={() => setMostrarFormulario(true)} // Mostrar el formulario para agregar un nuevo recordatorio
            >
              <span className="plus-icon">+</span> Nuevo Recordatorio
            </button>
          </div>
        </div>

        <div className="reminders-container">
          {recordatorios.map((recordatorio) => (
            <ReminderCard
              key={recordatorio.id}
              recordatorio={recordatorio}
              toggleCompletado={toggleCompletado}
              iniciarEdicion={iniciarEdicion}
              eliminarRecordatorio={eliminarRecordatorio}
            />
          ))}
        </div>

        {/* Modal para agregar un nuevo recordatorio */}
        {mostrarFormulario && (
          <div className="modal-overlay">
            <div className="modal-container">
              <h3 className="modal-title">Agregar Nuevo Recordatorio</h3>
              <div className="form-group">
                <label>
                  Título*:
                  <span className="char-counter">
                    ({nuevoRecordatorio.titulo.length}/60)
                  </span>
                </label>
                <input
                  type="text"
                  value={nuevoRecordatorio.titulo}
                  onChange={(e) =>
                    setNuevoRecordatorio({ ...nuevoRecordatorio, titulo: e.target.value })
                  }
                  placeholder="Título del recordatorio"
                  className={!nuevoRecordatorio.titulo ? 'invalid-field' : ''}
                  maxLength={60}
                />
              </div>
              <div className="form-group">
                <label>
                  Descripción*:
                  <span className="char-counter">
                    ({nuevoRecordatorio.descripcion.length}/250)
                  </span>
                </label>
                <textarea
                  value={nuevoRecordatorio.descripcion}
                  onChange={(e) =>
                    setNuevoRecordatorio({ ...nuevoRecordatorio, descripcion: e.target.value })
                  }
                  placeholder="Descripción detallada"
                  className={!nuevoRecordatorio.descripcion ? 'invalid-field' : ''}
                  maxLength={250}
                />
              </div>
              <div className="form-group">
                <label>Fecha*:</label>
                <input
                  type="date"
                  value={nuevoRecordatorio.fecha}
                  onChange={(e) => {
                    const value = e.target.value;
                    const year = value.split('-')[0];
                    if (year && year.length > 4) {
                      const truncatedYear = year.slice(0, 4);
                      const newValue = `${truncatedYear}-${value.split('-')[1] || ''}-${value.split('-')[2] || ''}`;
                      setNuevoRecordatorio({ ...nuevoRecordatorio, fecha: newValue });
                    } else {
                      setNuevoRecordatorio({ ...nuevoRecordatorio, fecha: value });
                    }
                  }}
                  className={!nuevoRecordatorio.fecha ? 'invalid-field' : ''}
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </button>
                <button className="submit-btn" onClick={agregarRecordatorio}>
                  Guardar Recordatorio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar un recordatorio */}
        {mostrarModalEdicion && (
          <div className="modal-overlay">
            <div className="modal-container">
              <h3 className="modal-title">Editar Recordatorio</h3>
              <div className="form-group">
                <label>
                  Título*:
                  <span className="char-counter">
                    ({editando?.titulo.length || 0}/60)
                  </span>
                </label>
                <input
                  type="text"
                  value={editando?.titulo || ''}
                  onChange={(e) => setEditando({ ...editando, titulo: e.target.value })}
                  className={!editando?.titulo ? 'invalid-field' : ''}
                  maxLength={60}
                />
              </div>
              <div className="form-group">
                <label>
                  Descripción*:
                  <span className="char-counter">
                    ({editando?.descripcion.length || 0}/250)
                  </span>
                </label>
                <textarea
                  value={editando?.descripcion || ''}
                  onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })}
                  className={!editando?.descripcion ? 'invalid-field' : ''}
                  maxLength={250}
                />
              </div>
              <div className="form-group">
                <label>Fecha*:</label>
                <input
                  type="date"
                  value={editando?.fecha || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const year = value.split('-')[0];
                    if (year && year.length > 4) {
                      const truncatedYear = year.slice(0, 4);
                      const newValue = `${truncatedYear}-${value.split('-')[1] || ''}-${value.split('-')[2] || ''}`;
                      setEditando({ ...editando, fecha: newValue });
                    } else {
                      setEditando({ ...editando, fecha: value });
                    }
                  }}
                  className={!editando?.fecha ? 'invalid-field' : ''}
                />
              </div>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setMostrarModalEdicion(false)}
                >
                  Cancelar
                </button>
                <button
                  className="submit-btn"
                  onClick={guardarEdicion}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recordatorios;



