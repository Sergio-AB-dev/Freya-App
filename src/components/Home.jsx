import "../styles/home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="saludo">
            <div className="saludo__bienvenida">
                <p>Hola :) bienvenido a tu espacio de gestión académica</p>
                <p>Así que <span className="saludo__bienvenida--dots"></span></p>
            </div>
            <div className="saludo__botones">
                <button className="saludo__boton boton--creacion" onClick={() => navigate("/register")}>Soy nuevo</button>
                <button className="saludo__boton boton--inicio" onClick={() => navigate("/login")}>Ya tengo cuenta</button>
            </div>
        </div>
    );
};

export default Home;
