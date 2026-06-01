import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServicoArmazenamento } from '../../services/ServicoArmazenamento';
import { Curso, Trilha, Categoria, Carreira, TrilhaCurso, CarreiraTrilha } from '../../models/Entidades';

export const AdministracaoPages = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('cursos');

    // Dados
    const [cursos, setCursos] = useState<any[]>([]);
    const [trilhas, setTrilhas] = useState<any[]>([]);
    const [planos, setPlanos] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [carreiras, setCarreiras] = useState<any[]>([]);

    // Estados dos formulários Modais
    const [showCursoModal, setShowCursoModal] = useState(false);
    const [showTrilhaModal, setShowTrilhaModal] = useState(false);
    const [showPlanoModal, setShowPlanoModal] = useState(false);
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [showCarreiraModal, setShowCarreiraModal] = useState(false);

    // Formulários
    const [cursoForm, setCursoForm] = useState({ ID_Curso: 0, Titulo: '', Descricao: '', ID_Categoria: 1, Nivel: 'Iniciante', ImgUrl: '' });
    const [trilhaForm, setTrilhaForm] = useState({ ID_Trilha: 0, Titulo: '', Descricao: '', ID_Categoria: 1, cursosSelecionados: [] as number[] });
    const [planoForm, setPlanoForm] = useState({ ID_Plano: 0, Nome: '', Descricao: '', Preco: 0, DuracaoMeses: 1 });
    const [categoriaForm, setCategoriaForm] = useState({ ID_Categoria: 0, Nome: '', Descricao: '' });
    const [carreiraForm, setCarreiraForm] = useState({ ID_Carreira: 0, Titulo: '', Descricao: '', trilhasSelecionadas: [] as number[] });

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
        loadDados();
    }, [navigate]);

    const loadDados = () => {
        ServicoArmazenamento.init();
        setCursos(ServicoArmazenamento.getAll('Cursos'));
        setTrilhas(ServicoArmazenamento.getAll('Trilhas'));
        setPlanos(ServicoArmazenamento.getAll('Planos'));
        setUsuarios(ServicoArmazenamento.getAll('Usuarios'));
        setCategorias(ServicoArmazenamento.getAll('Categorias'));
        setCarreiras(ServicoArmazenamento.getAll('Carreiras'));
    };

    const handleLogout = () => {
        localStorage.removeItem('usuarioLogado');
        navigate('/login');
    };

    // ===================================
    // CRUD Cursos
    // ===================================
    const handleSaveCurso = (e: React.FormEvent) => {
        e.preventDefault();
        const catId = cursoForm.ID_Categoria || (categorias.length > 0 ? categorias[0].ID_Categoria : 1);
        const novoCurso = new Curso(cursoForm.ID_Curso, cursoForm.Titulo, cursoForm.Descricao, admin.ID_Usuario, catId, cursoForm.Nivel, null, 0, 0, cursoForm.ImgUrl);
        if (cursoForm.ID_Curso > 0) {
            ServicoArmazenamento.update('Cursos', 'ID_Curso', cursoForm.ID_Curso, novoCurso);
        } else {
            ServicoArmazenamento.insert('Cursos', novoCurso);
        }
        setShowCursoModal(false);
        loadDados();
        setCursoForm({ ID_Curso: 0, Titulo: '', Descricao: '', ID_Categoria: 1, Nivel: 'Iniciante', ImgUrl: '' });
    };

    const openEditCurso = (c: any) => {
        setCursoForm({ ID_Curso: c.ID_Curso, Titulo: c.Titulo, Descricao: c.Descricao, ID_Categoria: c.ID_Categoria, Nivel: c.Nivel, ImgUrl: c.ImgUrl || '' });
        setShowCursoModal(true);
    };

    const handleDeleteCurso = (id: number) => {
        if (window.confirm('Deseja excluir este curso?')) {
            ServicoArmazenamento.delete('Cursos', 'ID_Curso', id);
            loadDados();
        }
    };

    // ===================================
    // CRUD Categorias
    // ===================================
    const handleSaveCategoria = (e: React.FormEvent) => {
        e.preventDefault();
        const novaCat = new Categoria(categoriaForm.ID_Categoria, categoriaForm.Nome, categoriaForm.Descricao);
        if (categoriaForm.ID_Categoria > 0) {
            ServicoArmazenamento.update('Categorias', 'ID_Categoria', categoriaForm.ID_Categoria, novaCat);
        } else {
            ServicoArmazenamento.insert('Categorias', novaCat);
        }
        setShowCategoriaModal(false);
        loadDados();
        setCategoriaForm({ ID_Categoria: 0, Nome: '', Descricao: '' });
    };

    const openEditCategoria = (c: any) => {
        setCategoriaForm({ ID_Categoria: c.ID_Categoria, Nome: c.Nome, Descricao: c.Descricao });
        setShowCategoriaModal(true);
    };

    const handleDeleteCategoria = (id: number) => {
        if (window.confirm('Deseja excluir esta categoria?')) {
            ServicoArmazenamento.delete('Categorias', 'ID_Categoria', id);
            loadDados();
        }
    };

    // ===================================
    // CRUD Trilhas
    // ===================================
    const handleSaveTrilha = (e: React.FormEvent) => {
        e.preventDefault();
        const catId = trilhaForm.ID_Categoria || (categorias.length > 0 ? categorias[0].ID_Categoria : 1);
        const novaTrilha = new Trilha(trilhaForm.ID_Trilha, trilhaForm.Titulo, trilhaForm.Descricao, catId);
        
        let targetTrilhaId = trilhaForm.ID_Trilha;
        if (trilhaForm.ID_Trilha > 0) {
            ServicoArmazenamento.update('Trilhas', 'ID_Trilha', trilhaForm.ID_Trilha, novaTrilha);
            // Remove antigos vínculos
            let items = ServicoArmazenamento.getAll('Trilhas_Cursos');
            items = items.filter((i: any) => String(i.ID_Trilha) !== String(trilhaForm.ID_Trilha));
            localStorage.setItem('Trilhas_Cursos', JSON.stringify(items));
        } else {
            const savedTrilha = ServicoArmazenamento.insert('Trilhas', novaTrilha);
            targetTrilhaId = savedTrilha.ID_Trilha;
        }

        trilhaForm.cursosSelecionados.forEach((cId, index) => {
            ServicoArmazenamento.insert('Trilhas_Cursos', new TrilhaCurso(targetTrilhaId, cId, index + 1));
        });

        setShowTrilhaModal(false);
        loadDados();
        setTrilhaForm({ ID_Trilha: 0, Titulo: '', Descricao: '', ID_Categoria: 1, cursosSelecionados: [] });
    };

    const openEditTrilha = (t: any) => {
        const cursosRelacionados = ServicoArmazenamento.getByProperty('Trilhas_Cursos', 'ID_Trilha', t.ID_Trilha);
        const selIds = cursosRelacionados.map(rc => rc.ID_Curso);
        setTrilhaForm({ ID_Trilha: t.ID_Trilha, Titulo: t.Titulo, Descricao: t.Descricao, ID_Categoria: t.ID_Categoria, cursosSelecionados: selIds });
        setShowTrilhaModal(true);
    };

    const handleDeleteTrilha = (id: number) => {
        if (window.confirm('Deseja excluir esta trilha?')) {
            ServicoArmazenamento.delete('Trilhas', 'ID_Trilha', id);
            loadDados();
        }
    };

    // ===================================
    // CRUD Carreiras
    // ===================================
    const handleSaveCarreira = (e: React.FormEvent) => {
        e.preventDefault();
        const novaCarreira = new Carreira(carreiraForm.ID_Carreira, carreiraForm.Titulo, carreiraForm.Descricao);
        
        let targetCarreiraId = carreiraForm.ID_Carreira;
        if (carreiraForm.ID_Carreira > 0) {
            ServicoArmazenamento.update('Carreiras', 'ID_Carreira', carreiraForm.ID_Carreira, novaCarreira);
            // Remove antigos
            let items = ServicoArmazenamento.getAll('Carreiras_Trilhas');
            items = items.filter((i: any) => String(i.ID_Carreira) !== String(carreiraForm.ID_Carreira));
            localStorage.setItem('Carreiras_Trilhas', JSON.stringify(items));
        } else {
            const savedCarreira = ServicoArmazenamento.insert('Carreiras', novaCarreira);
            targetCarreiraId = savedCarreira.ID_Carreira;
        }

        carreiraForm.trilhasSelecionadas.forEach((tId, index) => {
            ServicoArmazenamento.insert('Carreiras_Trilhas', new CarreiraTrilha(targetCarreiraId, tId, index + 1));
        });

        setShowCarreiraModal(false);
        loadDados();
        setCarreiraForm({ ID_Carreira: 0, Titulo: '', Descricao: '', trilhasSelecionadas: [] });
    };

    const openEditCarreira = (c: any) => {
        const trilhasRelacionadas = ServicoArmazenamento.getByProperty('Carreiras_Trilhas', 'ID_Carreira', c.ID_Carreira);
        const selIds = trilhasRelacionadas.map(rc => rc.ID_Trilha);
        setCarreiraForm({ ID_Carreira: c.ID_Carreira, Titulo: c.Titulo, Descricao: c.Descricao, trilhasSelecionadas: selIds });
        setShowCarreiraModal(true);
    };

    const handleDeleteCarreira = (id: number) => {
        if (window.confirm('Deseja excluir esta carreira?')) {
            ServicoArmazenamento.delete('Carreiras', 'ID_Carreira', id);
            loadDados();
        }
    };

    // ===================================
    // CRUD Planos
    // ===================================
    const handleSavePlano = (e: React.FormEvent) => {
        e.preventDefault();
        const pAtualizado = { Nome: planoForm.Nome, Descricao: planoForm.Descricao, Preco: Number(planoForm.Preco), DuracaoMeses: Number(planoForm.DuracaoMeses) };
        ServicoArmazenamento.update('Planos', 'ID_Plano', planoForm.ID_Plano, pAtualizado);
        setShowPlanoModal(false);
        loadDados();
    };

    const openEditPlano = (p: any) => {
        setPlanoForm({ ID_Plano: p.ID_Plano, Nome: p.Nome, Descricao: p.Descricao, Preco: p.Preco, DuracaoMeses: p.DuracaoMeses });
        setShowPlanoModal(true);
    };

    // ===================================
    // Usuários
    // ===================================
    const handleDeleteUsuario = (id: number) => {
        if (id === admin.ID_Usuario) {
            alert('Você não pode excluir sua própria conta enquanto está logado.');
            return;
        }
        if (window.confirm('Deseja realmente excluir este usuário?')) {
            ServicoArmazenamento.delete('Usuarios', 'ID_Usuario', id);
            loadDados();
        }
    };


    const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' };
    const modalContentStyle: React.CSSProperties = { backgroundColor: 'var(--dark-card)', padding: '20px', borderRadius: '10px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)', color: 'var(--text-main)', maxHeight: '90vh', overflowY: 'auto' };

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
                            <span className="text-muted me-3">Olá, {admin?.NomeCompleto || 'Admin'}</span>
                            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Sair</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">

                <div className="row">
                    <div className="col-12">
                        
                        {/* Aba Cursos */}
                        {activeTab === 'cursos' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2>Cursos Cadastrados</h2>
                                    <button className="btn btn-primary" onClick={() => { setCursoForm({ ID_Curso: 0, Titulo: '', Descricao: '', ID_Categoria: 1, Nivel: 'Iniciante', ImgUrl: '' }); setShowCursoModal(true); }}>+ Novo Curso</button>
                                </div>
                                <div className="card card-custom p-0 overflow-hidden">
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover mb-0">
                                            <thead><tr><th>ID</th><th>Título</th><th>Nível</th><th>Ações</th></tr></thead>
                                            <tbody>
                                                {cursos.length === 0 && <tr><td colSpan={4} className="text-center">Nenhum curso cadastrado.</td></tr>}
                                                {cursos.map(c => (
                                                    <tr key={c.ID_Curso}>
                                                        <td>{c.ID_Curso}</td>
                                                        <td>{c.Titulo}</td>
                                                        <td>{c.Nivel}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => openEditCurso(c)}><i className="bi bi-pencil"></i> Editar</button>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCurso(c.ID_Curso)}><i className="bi bi-trash"></i> Excluir</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Aba Categorias */}
                        {activeTab === 'categorias' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2>Categorias de Curso</h2>
                                    <button className="btn btn-primary" onClick={() => { setCategoriaForm({ ID_Categoria: 0, Nome: '', Descricao: '' }); setShowCategoriaModal(true); }}>+ Nova Categoria</button>
                                </div>
                                <div className="card card-custom p-0 overflow-hidden">
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover mb-0">
                                            <thead><tr><th>ID</th><th>Nome</th><th>Descrição</th><th>Ações</th></tr></thead>
                                            <tbody>
                                                {categorias.length === 0 && <tr><td colSpan={4} className="text-center">Nenhuma categoria.</td></tr>}
                                                {categorias.map(c => (
                                                    <tr key={c.ID_Categoria}>
                                                        <td>{c.ID_Categoria}</td>
                                                        <td>{c.Nome}</td>
                                                        <td>{c.Descricao}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => openEditCategoria(c)}><i className="bi bi-pencil"></i> Editar</button>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCategoria(c.ID_Categoria)}><i className="bi bi-trash"></i> Excluir</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Aba Trilhas */}
                        {activeTab === 'trilhas' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2>Trilhas de Aprendizagem</h2>
                                    <button className="btn btn-primary" onClick={() => { setTrilhaForm({ ID_Trilha: 0, Titulo: '', Descricao: '', ID_Categoria: 1, cursosSelecionados: [] }); setShowTrilhaModal(true); }}>+ Nova Trilha</button>
                                </div>
                                <div className="card card-custom p-0 overflow-hidden">
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover mb-0">
                                            <thead><tr><th>ID</th><th>Título</th><th>Descrição</th><th>Ações</th></tr></thead>
                                            <tbody>
                                                {trilhas.length === 0 && <tr><td colSpan={4} className="text-center">Nenhuma trilha cadastrada.</td></tr>}
                                                {trilhas.map(t => (
                                                    <tr key={t.ID_Trilha}>
                                                        <td>{t.ID_Trilha}</td>
                                                        <td>{t.Titulo}</td>
                                                        <td>{t.Descricao}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => openEditTrilha(t)}><i className="bi bi-pencil"></i> Editar</button>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTrilha(t.ID_Trilha)}><i className="bi bi-trash"></i> Excluir</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Aba Carreiras */}
                        {activeTab === 'carreiras' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2>Carreiras (Conjunto de Trilhas)</h2>
                                    <button className="btn btn-primary" onClick={() => { setCarreiraForm({ ID_Carreira: 0, Titulo: '', Descricao: '', trilhasSelecionadas: [] }); setShowCarreiraModal(true); }}>+ Nova Carreira</button>
                                </div>
                                <div className="card card-custom p-0 overflow-hidden">
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover mb-0">
                                            <thead><tr><th>ID</th><th>Título</th><th>Descrição</th><th>Ações</th></tr></thead>
                                            <tbody>
                                                {carreiras.length === 0 && <tr><td colSpan={4} className="text-center">Nenhuma carreira cadastrada.</td></tr>}
                                                {carreiras.map(c => (
                                                    <tr key={c.ID_Carreira}>
                                                        <td>{c.ID_Carreira}</td>
                                                        <td>{c.Titulo}</td>
                                                        <td>{c.Descricao}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => openEditCarreira(c)}><i className="bi bi-pencil"></i> Editar</button>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCarreira(c.ID_Carreira)}><i className="bi bi-trash"></i> Excluir</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Aba Planos */}
                        {activeTab === 'planos' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2>Gestão de Planos</h2>
                                </div>
                                <div className="card card-custom p-0 overflow-hidden">
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover mb-0">
                                            <thead><tr><th>ID</th><th>Nome</th><th>Preço</th><th>Ações</th></tr></thead>
                                            <tbody>
                                                {planos.map(p => (
                                                    <tr key={p.ID_Plano}>
                                                        <td>{p.ID_Plano}</td>
                                                        <td>{p.Nome}</td>
                                                        <td>R$ {p.Preco.toFixed(2)}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-warning" onClick={() => openEditPlano(p)}><i className="bi bi-pencil"></i> Editar</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Aba Usuários */}
                        {activeTab === 'usuarios' && (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2>Relatório de Usuários</h2>
                                </div>
                                <div className="card card-custom p-0 overflow-hidden">
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover mb-0">
                                            <thead><tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Role</th><th>Ações</th></tr></thead>
                                            <tbody>
                                                {usuarios.map(u => (
                                                    <tr key={u.ID_Usuario}>
                                                        <td>{u.ID_Usuario}</td>
                                                        <td>{u.NomeCompleto}</td>
                                                        <td>{u.Email}</td>
                                                        <td>{u.Role}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUsuario(u.ID_Usuario)}><i className="bi bi-trash"></i> Excluir</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>

            {/* Modal Novo/Editar Curso */}
            {showCursoModal && (
                <div style={modalOverlayStyle}>
                    <form style={modalContentStyle} onSubmit={handleSaveCurso}>
                        <h4 className="mb-4">{cursoForm.ID_Curso > 0 ? 'Editar Curso' : 'Cadastrar Novo Curso'}</h4>
                        <div className="mb-3">
                            <label className="form-label">Título do Curso</label>
                            <input type="text" className="form-control" value={cursoForm.Titulo} onChange={e => setCursoForm({...cursoForm, Titulo: e.target.value})} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Descrição</label>
                            <textarea className="form-control" value={cursoForm.Descricao} onChange={e => setCursoForm({...cursoForm, Descricao: e.target.value})} required></textarea>
                        </div>
                        <div className="row">
                            <div className="col-6 mb-3">
                                <label className="form-label">Categoria</label>
                                <select className="form-select" value={cursoForm.ID_Categoria} onChange={e => setCursoForm({...cursoForm, ID_Categoria: Number(e.target.value)})} required>
                                    {categorias.map(cat => <option key={cat.ID_Categoria} value={cat.ID_Categoria}>{cat.Nome}</option>)}
                                </select>
                            </div>
                            <div className="col-6 mb-3">
                                <label className="form-label">Nível</label>
                                <select className="form-select" value={cursoForm.Nivel} onChange={e => setCursoForm({...cursoForm, Nivel: e.target.value})} required>
                                    <option value="Iniciante">Iniciante</option>
                                    <option value="Intermediário">Intermediário</option>
                                    <option value="Avançado">Avançado</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label">URL da Imagem</label>
                            <input type="url" className="form-control" value={cursoForm.ImgUrl} onChange={e => setCursoForm({...cursoForm, ImgUrl: e.target.value})} placeholder="https://" />
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowCursoModal(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Salvar Curso</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Nova/Editar Categoria */}
            {showCategoriaModal && (
                <div style={modalOverlayStyle}>
                    <form style={modalContentStyle} onSubmit={handleSaveCategoria}>
                        <h4 className="mb-4">{categoriaForm.ID_Categoria > 0 ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}</h4>
                        <div className="mb-3">
                            <label className="form-label">Nome da Categoria</label>
                            <input type="text" className="form-control" value={categoriaForm.Nome} onChange={e => setCategoriaForm({...categoriaForm, Nome: e.target.value})} required />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Descrição</label>
                            <textarea className="form-control" value={categoriaForm.Descricao} onChange={e => setCategoriaForm({...categoriaForm, Descricao: e.target.value})} required></textarea>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowCategoriaModal(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Salvar Categoria</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Nova/Editar Carreira */}
            {showCarreiraModal && (
                <div style={modalOverlayStyle}>
                    <form style={modalContentStyle} onSubmit={handleSaveCarreira}>
                        <h4 className="mb-4">{carreiraForm.ID_Carreira > 0 ? 'Editar Carreira' : 'Cadastrar Nova Carreira'}</h4>
                        <div className="mb-3">
                            <label className="form-label">Título da Carreira</label>
                            <input type="text" className="form-control" value={carreiraForm.Titulo} onChange={e => setCarreiraForm({...carreiraForm, Titulo: e.target.value})} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Descrição</label>
                            <textarea className="form-control" value={carreiraForm.Descricao} onChange={e => setCarreiraForm({...carreiraForm, Descricao: e.target.value})} required></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Selecione as Trilhas que compõem esta Carreira</label>
                            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '5px' }}>
                                {trilhas.map(t => (
                                    <div className="form-check" key={t.ID_Trilha}>
                                        <input className="form-check-input" type="checkbox" value={t.ID_Trilha} 
                                            checked={carreiraForm.trilhasSelecionadas.includes(t.ID_Trilha)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                const tId = t.ID_Trilha;
                                                if (checked) {
                                                    setCarreiraForm({ ...carreiraForm, trilhasSelecionadas: [...carreiraForm.trilhasSelecionadas, tId] });
                                                } else {
                                                    setCarreiraForm({ ...carreiraForm, trilhasSelecionadas: carreiraForm.trilhasSelecionadas.filter(id => id !== tId) });
                                                }
                                            }}
                                        />
                                        <label className="form-check-label text-muted">{t.Titulo}</label>
                                    </div>
                                ))}
                                {trilhas.length === 0 && <small className="text-muted">Nenhuma trilha disponível.</small>}
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowCarreiraModal(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Salvar Carreira</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Nova/Editar Trilha */}
            {showTrilhaModal && (
                <div style={modalOverlayStyle}>
                    <form style={modalContentStyle} onSubmit={handleSaveTrilha}>
                        <h4 className="mb-4">{trilhaForm.ID_Trilha > 0 ? 'Editar Trilha' : 'Cadastrar Nova Trilha'}</h4>
                        <div className="mb-3">
                            <label className="form-label">Título da Trilha</label>
                            <input type="text" className="form-control" value={trilhaForm.Titulo} onChange={e => setTrilhaForm({...trilhaForm, Titulo: e.target.value})} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Categoria Alvo</label>
                            <select className="form-select" value={trilhaForm.ID_Categoria} onChange={e => setTrilhaForm({...trilhaForm, ID_Categoria: Number(e.target.value)})} required>
                                {categorias.map(cat => <option key={cat.ID_Categoria} value={cat.ID_Categoria}>{cat.Nome}</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Descrição</label>
                            <textarea className="form-control" value={trilhaForm.Descricao} onChange={e => setTrilhaForm({...trilhaForm, Descricao: e.target.value})} required></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Selecione os Cursos desta Trilha</label>
                            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '5px' }}>
                                {cursos.map(c => (
                                    <div className="form-check" key={c.ID_Curso}>
                                        <input className="form-check-input" type="checkbox" value={c.ID_Curso} 
                                            checked={trilhaForm.cursosSelecionados.includes(c.ID_Curso)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                const cId = c.ID_Curso;
                                                if (checked) {
                                                    setTrilhaForm({ ...trilhaForm, cursosSelecionados: [...trilhaForm.cursosSelecionados, cId] });
                                                } else {
                                                    setTrilhaForm({ ...trilhaForm, cursosSelecionados: trilhaForm.cursosSelecionados.filter(id => id !== cId) });
                                                }
                                            }}
                                        />
                                        <label className="form-check-label text-muted">{c.Titulo}</label>
                                    </div>
                                ))}
                                {cursos.length === 0 && <small className="text-muted">Nenhum curso disponível.</small>}
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowTrilhaModal(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Salvar Trilha</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Editar Plano */}
            {showPlanoModal && (
                <div style={modalOverlayStyle}>
                    <form style={modalContentStyle} onSubmit={handleSavePlano}>
                        <h4 className="mb-4">Editar Plano</h4>
                        <div className="mb-3">
                            <label className="form-label">Nome do Plano</label>
                            <input type="text" className="form-control" value={planoForm.Nome} onChange={e => setPlanoForm({...planoForm, Nome: e.target.value})} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Descrição</label>
                            <textarea className="form-control" value={planoForm.Descricao} onChange={e => setPlanoForm({...planoForm, Descricao: e.target.value})} required></textarea>
                        </div>
                        <div className="row mb-4">
                            <div className="col-6">
                                <label className="form-label">Preço (R$)</label>
                                <input type="number" step="0.01" className="form-control" value={planoForm.Preco} onChange={e => setPlanoForm({...planoForm, Preco: Number(e.target.value)})} required />
                            </div>
                            <div className="col-6">
                                <label className="form-label">Duração (Meses)</label>
                                <input type="number" className="form-control" value={planoForm.DuracaoMeses} onChange={e => setPlanoForm({...planoForm, DuracaoMeses: Number(e.target.value)})} required />
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowPlanoModal(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
