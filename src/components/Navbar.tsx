import { Link } from 'react-router-dom';
import { BookOpen, Compass, List, Play, Users, CreditCard, Award } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-blue-gradient custom-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <BookOpen className="me-2" />
          EstudosApp
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/trilhas"><Compass className="me-1" size={18} /> Trilhas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cursos"><List className="me-1" size={18} /> Cursos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/planos"><CreditCard className="me-1" size={18} /> Planos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/modulos"><List className="me-1" size={18} /> Módulos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/aulas"><Play className="me-1" size={18} /> Aulas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/usuarios"><Users className="me-1" size={18} /> Usuários</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/assinaturas"><CreditCard className="me-1" size={18} /> Assinaturas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/certificados"><Award className="me-1" size={18} /> Certificados</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
