import React, { useState, useEffect } from 'react';
import '../styles/calificaciones.css';
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

// Declaramos la referencia a la colección FUERA del componente
const materiasCollectionRef = collection(db, 'calificaciones');

/**
 * Componente funcional para la gestión de calificaciones.
 * Permite a los usuarios agregar materias, registrar notas por materia,
 * calcular el promedio y eliminar tanto materias como notas individuales.
 * Utiliza Firebase Firestore para la persistencia de los datos en tiempo real.
 */
function Calificaciones() {
  // Estado para almacenar la lista de materias cargadas desde Firestore.
  const [materias, setMaterias] = useState([]);
  // Estado para controlar el nombre de la nueva materia que se va a agregar.
  const [nuevaMateriaNombre, setNuevaMateriaNombre] = useState('');
  // Estado para gestionar la adición de una nueva nota, incluyendo su tipo, valor y la materia a la que pertenece.
  const [nuevaNota, setNuevaNota] = useState({ tipo: '', valor: '', materiaId: null });
  // Estado para controlar la edición de una nota existente, almacenando la materia, el índice y los nuevos valores.
  const [editandoNota, setEditandoNota] = useState({ materiaId: null, index: null, tipo: '', valor: '' });
  // Estado para la gestión de la ventana de confirmación para acciones críticas como eliminar.
  const [confirmacion, setConfirmacion] = useState({
    visible: false,
    mensaje: '',
    accion: null,
    // Función para cerrar la ventana de confirmación, restableciendo su estado.
    cancelar: () => setConfirmacion({ ...confirmacion, visible: false }),
  });

  /**
   * useEffect hook que se ejecuta una vez al montar el componente.
   * Establece un listener en tiempo real para la colección de materias en Firestore.
   * Cada vez que hay un cambio en la colección, el snapshot se actualiza y
   * el estado 'materias' se actualiza con los datos más recientes.
   * La función de retorno del useEffect desuscribe el listener para evitar fugas de memoria.
   */
  useEffect(() => {
    const unsubscribe = onSnapshot(materiasCollectionRef, (snapshot) => {
      const materiasDesdeFirestore = [];
      snapshot.forEach((doc) => {
        materiasDesdeFirestore.push({ id: doc.id, ...doc.data() });
      });
      setMaterias(materiasDesdeFirestore);
    });

    return () => unsubscribe();
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar.

  /**
   * Función para calcular el promedio de una lista de notas.
   * Recibe un array de objetos 'nota' y devuelve el promedio redondeado a dos decimales.
   * Si no hay notas, devuelve 0.
   * @param {Array<{valor: string}>} notas - Array de objetos con la propiedad 'valor' de la nota.
   * @returns {number} - El promedio de las notas.
   */
  const calcularPromedio = (notas) => {
    if (notas.length === 0) return 0;
    // Utiliza reduce para sumar los valores de las notas, convirtiéndolos a números flotantes.
    const suma = notas.reduce((total, nota) => total + parseFloat(nota.valor), 0);
    // Calcula el promedio y lo redondea a dos decimales para una mejor presentación.
    return Math.round((suma / notas.length) * 100) / 100;
  };

  /**
   * Función asíncrona para agregar una nueva materia a Firestore.
   * Solo se agrega si el nombre de la materia no está vacío después de eliminar espacios en blanco.
   * Utiliza la función 'addDoc' para añadir un nuevo documento a la colección 'materiasCollectionRef'.
   * Después de agregar la materia, resetea el estado del nombre de la nueva materia y cierra la confirmación.
   * En caso de error, lo registra en la consola.
   */
  const agregarMateriaFirestore = async () => {
    if (nuevaMateriaNombre.trim()) {
      try {
        await addDoc(materiasCollectionRef, {
          nombre: nuevaMateriaNombre.trim(),
          notas: [],
          promedio: 0,
        });
        setNuevaMateriaNombre('');
        cerrarConfirmacion();
      } catch (error) {
        console.error('Error al agregar materia:', error);
      }
    }
  };

  /**
   * Función asíncrona para eliminar una materia de Firestore.
   * Recibe el ID de la materia a eliminar y utiliza 'deleteDoc' para eliminar el documento correspondiente.
   * Cierra la ventana de confirmación después de la eliminación.
   * Registra cualquier error en la consola.
   * @param {string} id - El ID del documento de la materia a eliminar.
   */
  const eliminarMateriaFirestore = async (id) => {
    try {
      const materiaDocRef = doc(materiasCollectionRef, id);
      await deleteDoc(materiaDocRef);
      cerrarConfirmacion();
    } catch (error) {
      console.error('Error al eliminar materia:', error);
    }
  };

  /**
   * Función asíncrona para agregar una nueva nota a una materia específica en Firestore.
   * Extrae el tipo, valor y ID de la materia del estado 'nuevaNota'.
   * Valida que los campos tipo y valor no estén vacíos y que el ID de la materia sea válido.
   * Crea un objeto 'nota' con el tipo y el valor convertido a número flotante.
   * Obtiene el documento de la materia, actualiza su array de notas y recalcula el promedio.
   * Finalmente, resetea el estado 'nuevaNota'.
   */
  const agregarNotaFirestore = async () => {
    const { tipo, valor, materiaId } = nuevaNota;
    if (!tipo || !valor || materiaId === null) return;

    const nota = { tipo, valor: parseFloat(valor) };
    const materiaDocRef = doc(materiasCollectionRef, materiaId);

    try {
      const materiaSnap = await getDoc(materiaDocRef);
      if (materiaSnap.exists()) {
        const materiaData = materiaSnap.data();
        const nuevasNotas = [...(materiaData.notas || []), nota];
        const nuevoPromedio = calcularPromedio(nuevasNotas);
        await updateDoc(materiaDocRef, { notas: nuevasNotas, promedio: nuevoPromedio });
        setNuevaNota({ tipo: '', valor: '', materiaId: null });
      }
    } catch (error) {
      console.error('Error al agregar nota:', error);
    }
  };

  /**
   * Función asíncrona para eliminar una nota específica de una materia en Firestore.
   * Recibe el ID de la materia y el índice de la nota a eliminar.
   * Obtiene el documento de la materia, filtra el array de notas para excluir la nota en el índice proporcionado,
   * recalcula el promedio y actualiza el documento en Firestore.
   * Cierra la ventana de confirmación después de la eliminación.
   * @param {string} materiaId - El ID del documento de la materia.
   * @param {number} index - El índice de la nota a eliminar dentro del array de notas.
   */
  const eliminarNotaFirestore = async (materiaId, index) => {
    const materiaDocRef = doc(materiasCollectionRef, materiaId);
    try {
      const materiaSnap = await getDoc(materiaDocRef);
      if (materiaSnap.exists()) {
        const materiaData = materiaSnap.data();
        const nuevasNotas = materiaData.notas.filter((_, i) => i !== index);
        const nuevoPromedio = calcularPromedio(nuevasNotas);
        await updateDoc(materiaDocRef, { notas: nuevasNotas, promedio: nuevoPromedio });
        cerrarConfirmacion();
      }
    } catch (error) {
      console.error('Error al eliminar nota:', error);
    }
  };

  /**
   * Función asíncrona para guardar la nota editada en Firestore.
   * Extrae el ID de la materia, el índice de la nota y los nuevos valores del estado 'editandoNota'.
   * Crea un nuevo objeto 'nota' con los valores editados.
   * Obtiene el documento de la materia, crea una copia del array de notas,
   * reemplaza la nota en el índice especificado con la nueva nota, recalcula el promedio y actualiza Firestore.
   * Resetea el estado 'editandoNota' después de guardar.
   */
  const guardarNotaEditadaFirestore = async () => {
    const { materiaId, index, tipo, valor } = editandoNota;
    const nuevaNota = { tipo, valor: parseFloat(valor) };
    const materiaDocRef = doc(materiasCollectionRef, materiaId);

    try {
      const materiaSnap = await getDoc(materiaDocRef);
      if (materiaSnap.exists()) {
        const materiaData = materiaSnap.data();
        const nuevasNotas = [...(materiaData.notas || [])];
        nuevasNotas[index] = nuevaNota;
        const nuevoPromedio = calcularPromedio(nuevasNotas);
        await updateDoc(materiaDocRef, { notas: nuevasNotas, promedio: nuevoPromedio });
        setEditandoNota({ materiaId: null, index: null, tipo: '', valor: '' });
        cerrarConfirmacion();
      }
    } catch (error) {
      console.error('Error al guardar nota editada:', error);
    }
  };

  /**
   * Función para mostrar la ventana de confirmación con un mensaje y una acción específica a ejecutar.
   * @param {string} mensaje - El mensaje a mostrar en la ventana de confirmación.
   * @param {Function} accion - La función a ejecutar si el usuario confirma.
   */
  const mostrarConfirmacion = (mensaje, accion) => {
    setConfirmacion({ ...confirmacion, visible: true, mensaje, accion });
  };

  /**
   * Función para cerrar la ventana de confirmación, restableciendo su estado a los valores iniciales.
   */
  const cerrarConfirmacion = () => {
    setConfirmacion({ ...confirmacion, visible: false, mensaje: '', accion: null });
  };

  return (
    <div className="calificaciones-container">
      <h2 className="calificaciones-title">Mis Calificaciones</h2>

      {/* Formulario para agregar una nueva materia */}
      <form
        className="materia-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (nuevaMateriaNombre.trim())
            // Muestra la confirmación antes de agregar la materia.
            mostrarConfirmacion('¿Agregar esta materia?', agregarMateriaFirestore);
        }}
      >
        <input
          type="text"
          placeholder="Nombre de la materia"
          value={nuevaMateriaNombre}
          onChange={(e) => setNuevaMateriaNombre(e.target.value)}
          required
        />
        <button type="submit">Agregar Materia</button>
      </form>

      {/* Grid para mostrar las materias y sus calificaciones */}
      <div className="calificaciones-grid">
        {materias.map((materia) => (
          <div key={materia.id} className="calificacion-card">
            {/* Acciones disponibles para cada materia: agregar nota y eliminar materia */}
            <div className="calificacion-acciones">
              <button onClick={() => setNuevaNota({ ...nuevaNota, materiaId: materia.id })}>➕</button>
              <button onClick={() => mostrarConfirmacion('¿Eliminar esta materia?', () => eliminarMateriaFirestore(materia.id))}>🗑️</button>
            </div>

            <h3>{materia.nombre}</h3>

            {/* Contenedor para la lista de notas de la materia */}
            <div className="notas-container">
              {materia.notas && materia.notas.map((nota, index) => (
                <div key={index} className="nota-item">
                  {/* Condicional para mostrar el formulario de edición si la nota está en modo de edición */}
                  {editandoNota.materiaId === materia.id && editandoNota.index === index ? (
                    <form className="nota-edit-form" onSubmit={(e) => {
                      e.preventDefault();
                      // Muestra la confirmación antes de guardar la nota editada.
                      mostrarConfirmacion('¿Guardar cambios?', guardarNotaEditadaFirestore);
                    }}>
                      <input
                        name="tipo"
                        value={editandoNota.tipo}
                        onChange={(e) => setEditandoNota({ ...editandoNota, tipo: e.target.value })}
                        required
                      />
                      <input
                        type="number"
                        name="valor"
                        value={editandoNota.valor}
                        onChange={(e) => setEditandoNota({ ...editandoNota, valor: e.target.value })}
                        min="0"
                        max="5"
                        step="0.1"
                        required
                      />
                      <button type="submit">✓</button>
                      <button type="button" onClick={() => setEditandoNota({ materiaId: null, index: null, tipo: '', valor: '' })}>×</button>
                    </form>
                  ) : (
                    <>
                      {/* Información de la nota (tipo y valor) */}
                      <div className="nota-info">
                        <span className="nota-tipo">{nota.tipo}</span>
                        <span className="nota-valor">{nota.valor}</span>
                      </div>
                      {/* Acciones para la nota: editar y eliminar */}
                      <div className="nota-acciones">
                        <button onClick={() => setEditandoNota({ materiaId: materia.id, index, tipo: nota.tipo, valor: nota.valor })}>✏️</button>
                        <button onClick={() => mostrarConfirmacion('¿Eliminar esta nota?', () => eliminarNotaFirestore(materia.id, index))}>🗑️</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Formulario para agregar una nueva nota a la materia actual */}
            {nuevaNota.materiaId === materia.id && (
              <form className="nota-form" onSubmit={(e) => {
                e.preventDefault();
                agregarNotaFirestore();
              }}>
                <input
                  type="text"
                  placeholder="Tipo de nota"
                  value={nuevaNota.tipo}
                  onChange={(e) => setNuevaNota({ ...nuevaNota, tipo: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Nota (0-5)"
                  value={nuevaNota.valor}
                  onChange={(e) => setNuevaNota({ ...nuevaNota, valor: e.target.value })}
                  min="0"
                  max="5"
                  step="0.1"
                  required
                />
                <button type="submit">Agregar</button>
                <button type="button" onClick={() => setNuevaNota({ tipo: '', valor: '', materiaId: null })}>Cancelar</button>
              </form>
            )}

            {/* Sección para mostrar el promedio de la materia */}
            <div className="promedio-container">
              <div className="promedio-titulo">Promedio</div>
              <div className="promedio-valor">{materia.promedio}</div>
            </div>

            {/* Barra de progreso visual para el promedio */}
            <div className="calificacion-progreso">
              <div
                className="progreso-barra"
                style={{ width: `${(materia.promedio / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Componente condicional para la ventana de confirmación */}
      {confirmacion.visible && (
        <div className="confirmacion-overlay">
          <div className="confirmacion-modal">
            <p>{confirmacion.mensaje}</p>
            <div className="confirmacion-botones">
              <button onClick={confirmacion.accion} className="confirmar-btn">Confirmar</button>
              <button onClick={confirmacion.cancelar} className="cancelar-btn">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calificaciones;



