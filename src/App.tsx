import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Trilhas from './pages/Trilhas';
import Cursos from './pages/Cursos';
import Planos from './pages/Planos';
import Modulos from './pages/Modulos';
import Aulas from './pages/Aulas';
import Usuarios from './pages/Usuarios';
import Assinaturas from './pages/Assinaturas';
import Certificados from './pages/Certificados';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trilhas" element={<Trilhas />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/modulos" element={<Modulos />} />
            <Route path="/aulas" element={<Aulas />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/assinaturas" element={<Assinaturas />} />
            <Route path="/certificados" element={<Certificados />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
