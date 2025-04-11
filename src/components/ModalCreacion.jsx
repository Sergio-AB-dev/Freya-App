import React from "react";
import "../styles/apuntes.css";

const ModalCreacion = ({ modalVisible, closeModal }) => {
  return (
    <div
      className={`apuntes__modal ${modalVisible ? "apuntes__modal--visible" : ""}`}
      id="modal"
      onClick={(e) => {
        if (e.target.id === "modal") {
          closeModal(); // Solo cerrar si se da clic fuera del contenido
        }
      }}
    >
      <div className="apuntes__continer--Creacion" onClick={(e) => e.stopPropagation()}>
        {/* Aquí va tu contenido del modal: inputs, botones, etc */}
        <h2 style={{ color: "#fff", padding: "20px" }}>Aquí va el modal de creación de notas</h2>
      </div>
    </div>
  );
};

export default ModalCreacion;
