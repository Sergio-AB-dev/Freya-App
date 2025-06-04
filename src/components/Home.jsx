import "../styles/home.css";
import { useNavigate } from "react-router-dom";
import layeredWaves from "../ASSETS/layered-waves-haikei.jpeg";
import laptop from "../ASSETS/computadora-portatil.png";
import exam from "../ASSETS/examen.png";
import alarm from "../ASSETS/despertador.png";

const Home = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="saludo">
                <div className="saludo__bienvenida">
                    <p>Hola :) bienvenido a tu espacio de gestión académica</p>
                    <p>Así que <span className="saludo__bienvenida--dots"></span></p>
                </div>
            </div>

            <div className="separador__saludo">
                <img src={layeredWaves} alt="" />
            </div>

            <div className="descripcion">
                <p className="descripcion__titulo">¿No sabes qué puedes hacer?</p>
                <div className="descripcion__container--all">
                    <div className="descripcion__container">
                        <img src={laptop} alt="Computadora portátil" />
                        <div className="descripcion__container--text">
                            <p className="descripcion__container--text--title">Toma tus apuntes</p>
                            <p>Es simple... Aquí puedes escribir las cosas que quieras de todas las materias que quieras y tenerlas guardadas, como la app de tu teléfono pero <span>¡mejor!</span></p>
                        </div>
                    </div>
                    <div className="descripcion__container">
                        <img src={exam} alt="Examen" />
                        <div className="descripcion__container--text">
                            <p className="descripcion__container--text--title">Guarda tus calificaciones</p>
                            <p>Después de cada actividad que entregues puedes guardar tus calificaciones y ver tu desempeño, además de ver tu boletín entero <span>¿no es genial?</span></p>
                        </div>
                    </div>
                    <div className="descripcion__container">
                        <img src={alarm} alt="Despertador" />
                        <div className="descripcion__container--text">
                            <p className="descripcion__container--text--title">Recordatorios</p>
                            <p>Puedes poner recordatorios sobre fechas importantes (exámenes, presentaciones...) no te tienes que preocupar por nada <span>¡yo te aviso ;)</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
