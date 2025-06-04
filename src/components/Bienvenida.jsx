// src/components/Bienvenida.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import Header_bn from "./Header_Bn"
import '../styles/bienvenida.css';

const Bienvenida = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home'); // ya logueado va al Home con el Header
    } catch (error) {
      alert('Correo o contraseña incorrectos');
      console.error(error);
    }
  };

  return (
    <>
    <Header_bn />
    <div className="login__container">
      <form onSubmit={handleLogin} className="login__form">
        <h2>Ingresar</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">INGRESAR</button>
        <p className="Login_register">
          <Link to="/register" className="login__link">
            REGISTRATE 
          </Link>
        </p>
        <p>
          <Link to="/reset-password" className='reset_link'>¿Olvidaste tu contraseña?</Link>
        </p>
      </form>
    </div>
    </>
  );
};

export default Bienvenida;

