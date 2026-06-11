import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AbaCursos } from './components/AbaCursos';
import { AbaCategorias } from './components/AbaCategorias';
import { AbaTrilhas } from './components/AbaTrilhas';
import { AbaCarreiras } from './components/AbaCarreiras';
import { AbaPlanos } from './components/AbaPlanos';
import { AbaUsuarios } from './components/AbaUsuarios';

export const AdministracaoPages = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('cursos');

    useEffect(() => {
        const userJson = localStorage.getItem('usuarioLogado');
        if (!userJson) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userJson);
        if (user.Role !== 'admin') {
            navigate('/painel_aluno');
            return;
        }
        setAdmin(user);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('usuarioLogado');
        navigate('/login');
    };

    if (!admin) return <div>Carregando...</div>;

    return (
        <div style={{ backgroundColor: 'var(--dark-bg)', minHeight: '100vh', color: 'var(--text-main)' }}>
            <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
                <div className="container-fluid px-4">
                    <a className="navbar-brand" href="/">Forma<span>Pro</span> Admin</a>
                    
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="adminNavbar">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-4">
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${activeTab === 'cursos' ? 'active text-primary-custom fw-bold' : ''}`} onClick={() => setActiveTab('cursos')}>Cursos</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${activeTab === 'categorias' ? 'active text-primary-custom fw-bold' : ''}`} onClick={() => setActiveTab('categorias')}>Categorias</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${activeTab === 'trilhas' ? 'active text-primary-custom fw-bold' : ''}`} onClick={() => setActiveTab('trilhas')}>Trilhas</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${activeTab === 'carreiras' ? 'active text-primary-custom fw-bold' : ''}`} onClick={() => setActiveTab('carreiras')}>Carreiras</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${activeTab === 'planos' ? 'active text-primary-custom fw-bold' : ''}`} onClick={() => setActiveTab('planos')}>Planos</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${activeTab === 'usuarios' ? 'active text-primary-custom fw-bold' : ''}`} onClick={() => setActiveTab('usuarios')}>Usuários</button>
                            </li>
                        </ul>
                        <div className="d-flex align-items-center">
                            <span className="text-muted me-3">Olá, {admin.NomeCompleto || 'Admin'}</span>
                            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Sair</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">
                <div className="row">
                    <div className="col-12">
                        {activeTab === 'cursos' && <AbaCursos admin={admin} />}
                        {activeTab === 'categorias' && <AbaCategorias />}
                        {activeTab === 'trilhas' && <AbaTrilhas />}
                        {activeTab === 'carreiras' && <AbaCarreiras />}
                        {activeTab === 'planos' && <AbaPlanos />}
                        {activeTab === 'usuarios' && <AbaUsuarios admin={admin} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
