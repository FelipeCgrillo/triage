import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <h1>Sistema de Teletriage</h1>
            <div className="menu-container">
                <Link to="/consulta" className="menu-item">
                    <div className="menu-icon">🎙️</div>
                    <h2>Nueva Consulta</h2>
                    <p>Realizar una nueva consulta médica por voz</p>
                </Link>
                
                <Link to="/historial" className="menu-item">
                    <div className="menu-icon">📋</div>
                    <h2>Historial</h2>
                    <p>Ver el historial de consultas anteriores</p>
                </Link>
                
                <Link to="/informacion" className="menu-item">
                    <div className="menu-icon">ℹ️</div>
                    <h2>Información</h2>
                    <p>Acerca del sistema y cómo usarlo</p>
                </Link>
                
                <Link to="/emergencia" className="menu-item emergency">
                    <div className="menu-icon">🚨</div>
                    <h2>Emergencia</h2>
                    <p>Números de emergencia y contactos importantes</p>
                </Link>
            </div>
        </div>
    );
};

export default Home; 