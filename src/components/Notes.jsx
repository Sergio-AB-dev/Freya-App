// src/components/Notes.jsx
import React, { useState, useEffect } from 'react';
import layeredWaves from "../ASSETS/layered-waves-haikei.jpeg";
import "../styles/apuntes.css";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';

import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Notes = () => {
  const [userUid, setUserUid] = useState(null);
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    asignatura: '',
    titulo: '',
    contenido: '',
    color: '#1cb0f6'
  });
  const [editingId, setEditingId] = useState(null);
  const [bienvenidaText, setBienvenidaText] = useState('Estos son tus apuntes ;)');
  const [editable, setEditable] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
      } else {
        setUserUid(null);
        setNotes([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (userUid) {
      fetchNotes();
    }
  }, [userUid]);

  const fetchNotes = async () => {
    try {
      const notasQuery = query(
        collection(db, 'notes'),
        where("uid", "==", userUid)
      );
      const querySnapshot = await getDocs(notasQuery);
      const notesData = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setNotes(notesData);
    } catch (error) {
      console.error('Error obteniendo las notas:', error);
    }
  };

  useEffect(() => {
    let guiñando = true;
    const intervalo = setInterval(() => {
      setBienvenidaText(`Estos son tus apuntes ${guiñando ? ':)' : ';)'} `);
      guiñando = !guiñando;
    }, 600);
    return () => clearInterval(intervalo);
  }, []);

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setModalData({ ...modalData, [name]: value });
  };

  const handleColorChange = (color) => {
    if (editable) {
      setModalData({ ...modalData, color });
    }
  };

  const openModalForNew = () => {
    setModalData({ asignatura: '', titulo: '', contenido: '', color: '#1cb0f6' });
    setEditingId(null);
    setEditable(true);
    setModalVisible(true);
  };

  const openModalForEdit = (note) => {
    setModalData({
      asignatura: note.asignatura,
      titulo: note.titulo,
      contenido: note.contenido,
      color: note.color || '#1cb0f6'
    });
    setEditingId(note.id);
    setEditable(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSave = async () => {
    if (!modalData.asignatura.trim() || !modalData.titulo.trim()) {
      alert('Por favor completa asignatura y título');
      return;
    }

    try {
      if (editingId) {
        const noteDocRef = doc(db, 'notes', editingId);
        await updateDoc(noteDocRef, {
          asignatura: modalData.asignatura,
          titulo: modalData.titulo,
          contenido: modalData.contenido,
          color: modalData.color
        });
        setNotes(notes.map(note =>
          note.id === editingId
            ? { ...note, ...modalData }
            : note
        ));
      } else {
        const docRef = await addDoc(collection(db, 'notes'), {
          ...modalData,
          uid: userUid
        });
        setNotes([{ ...modalData, uid: userUid, id: docRef.id }, ...notes]);
      }
      closeModal();
    } catch (error) {
      console.error('Error al guardar la nota:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (!editingId) return;
      await deleteDoc(doc(db, 'notes', editingId));
      setNotes(notes.filter(note => note.id !== editingId));
      closeModal();
    } catch (error) {
      console.error('Error al eliminar la nota:', error);
    }
  };

  if (!userUid) {
    return (
      <div className="apuntes__container">
        <p className="apuntes__bienvenida">Debes iniciar sesión para ver tus apuntes.</p>
      </div>
    );
  }

  return (
    <div className="apuntes__container">
      <div className="apuntes">
        <p className="apuntes__bienvenida">{bienvenidaText}</p>
        <div className="apuntes__continer">
          <button className="apuntes__agregar" onClick={openModalForNew}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32">
              <path d="M480,224H288V32c0-17.673-14.327-32-32-32s-32,14.327-32,32v192H32c-17.673,0-32,14.327-32,32s14.327,32,32,32h192v192
              c0,17.673,14.327,32,32,32s32-14.327,32-32V288h192c17.673,0,32-14.327,32-32S497.673,224,480,224z"/>
            </svg>
          </button>

          {notes.map(note => (
            <div
              key={note.id}
              className="apuntes__guardado__card"
              style={{ backgroundColor: note.color }}
              onClick={() => openModalForEdit(note)}
            >
              <p className="apuntes__guardado__card--asignatura">{note.asignatura || "[Sin asignatura]"}</p>
              <p className="apuntes__guardado__card--titulo">{note.titulo || "[Sin título]"}</p>
            </div>
          ))}
        </div>
      </div>

      {modalVisible && (
        <div className="apuntes__modal apuntes__modal--visible" onClick={closeModal}>
          <div
            className="apuntes__continer--Creacion"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: modalData.color }}
          >
            <div className="apuntes__continer--Creacion__asignatura">
              <input
                type="text"
                name="asignatura"
                placeholder="¿Qué asignatura es?"
                className="apuntes__continer--Creacion__input"
                value={modalData.asignatura}
                onChange={handleModalInputChange}
                disabled={!editable}
              />
              <div className="apuntes__continer--Creacion__botones">
                {editingId && (
                  <button className="apuntes__eliminar" onClick={handleDelete}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24">
                      <path d="M448,85.333h-66.133C371.66,35.703,328.002,0.064,277.333,0h-42.667c-50.669,0.064-94.327,35.703-104.533,85.333H64
                        c-11.782,0-21.333,9.551-21.333,21.333S52.218,128,64,128h21.333v277.333C85.404,464.214,133.119,511.93,192,512h128
                        c58.881-0.07,106.596-47.786,106.667-106.667V128H448c11.782,0,21.333-9.551,21.333-21.333S459.782,85.333,448,85.333z"/>
                    </svg>
                  </button>
                )}
                <button className="apuntes__editar" onClick={() => setEditable(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M22.824,1.176a4.108,4.108,0,0,0-5.676,0L1.611,16.713A5.464,5.464,0,0,0,0,20.6v1.9A1.5,1.5,0,0,0,1.5,24H3.4
                      a5.464,5.464,0,0,0,3.889-1.611L22.824,6.852A4.018,4.018,0,0,0,22.824,1.176Z"/>
                  </svg>
                </button>
                <button className="apuntes__guardar" onClick={handleSave}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 507.506 507.506" width="24" height="24">
                    <path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0
                      c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0
                      c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="apuntes__continer--Creacion__asignatura">
              <input
                type="text"
                name="titulo"
                placeholder="Pon un título"
                className="apuntes__continer--Creacion__input-titulo"
                value={modalData.titulo}
                onChange={handleModalInputChange}
                disabled={!editable}
              />
              <div className="apuntes__continer--Creacion__botones">
                <button onClick={() => handleColorChange('#1cb0f6')} className="apuntes__continer--Creacion__botones--color1"></button>
                <button onClick={() => handleColorChange('#ff8002')} className="apuntes__continer--Creacion__botones--color2"></button>
                <button onClick={() => handleColorChange('#954ec1')} className="apuntes__continer--Creacion__botones--color3"></button>
              </div>
            </div>

            <div className="apuntes__continer--Creacion__texto">
              <textarea
                className="apuntes__continer--Creacion__textarea"
                placeholder="Escribe aquí tu texto..."
                name="contenido"
                dir="ltr"
                value={modalData.contenido}
                onChange={(e) => setModalData({ ...modalData, contenido: e.target.value })}
                disabled={!editable}
              />
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <img src={layeredWaves} alt="Decoración" />
      </footer>
    </div>
  );
};

export default Notes;
