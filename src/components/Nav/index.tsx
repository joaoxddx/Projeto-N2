import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const Nav = () => {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('formapro-theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('formapro-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
            <div className="container">
                <Link className="navbar-brand" to="/">Forma<span>Pro</span></Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="/#cursos">Cursos</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/#planos">Planos</a>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center">
                        <button className="btn btn-link text-white me-3 p-0" onClick={toggleTheme} style={{ textDecoration: 'none', fontSize: '1.2rem' }}>
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <Link to="/login" className="btn btn-outline-primary me-2">Entrar</Link>
                        <Link to="/login" className="btn btn-primary">Começar Agora</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
