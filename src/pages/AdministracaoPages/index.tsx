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
    const [showConteudoModal, setShowConteudoModal] = useState(false);

    // Formulários
    const [cursoForm, setCursoForm] = useState({ ID_Curso: 0, Titulo: '', Descricao: '', ID_Categoria: 1, Nivel: 'Iniciante', ImgUrl: '' });
    const [trilhaForm, setTrilhaForm] = useState({ ID_Trilha: 0, Titulo: '', Descricao: '', ID_Categoria: 1, cursosSelecionados: [] as number[] });
    const [planoForm, setPlanoForm] = useState({ ID_Plano: 0, Nome: '', Descricao: '', Preco: 0, DuracaoMeses: 1 });
    const [categoriaForm, setCategoriaForm] = useState({ ID_Categoria: 0, Nome: '', Descricao: '' });
    const [carreiraForm, setCarreiraForm] = useState({ ID_Carreira: 0, Titulo: '', Descricao: '', trilhasSelecionadas: [] as number[] });
    
    // Conteudo Curso (Modulos e Aulas)
    const [cursoSelecionado, setCursoSelecionado] = useState<any>(null);
    const [modulosCurso, setModulosCurso] = useState<any[]>([]);
    const [aulasCurso, setAulasCurso] = useState<any[]>([]);
    const [moduloForm, setModuloForm] = useState({ Titulo: '', Ordem: 1 });
    const [aulaForm, setAulaForm] = useState({ ID_Modulo: -1, Titulo: '', TipoConteudo: 'Video', DuracaoMinutos: 10, Ordem: 1 });
    const [filtroModuloId, setFiltroModuloId] = useState<string>('todos');

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

    const loadDados = async () => {
        setCursos(await ServicoArmazenamento.getAll('Cursos'));
        setTrilhas(await ServicoArmazenamento.getAll('Trilhas'));
        setPlanos(await ServicoArmazenamento.getAll('Planos'));
        setUsuarios(await ServicoArmazenamento.getAll('Usuarios'));
        setCategorias(await ServicoArmazenamento.getAll('Categorias'));
        setCarreiras(await ServicoArmazenamento.getAll('Carreiras'));
    };

    const handleLogout = () => {
        localStorage.removeItem('usuarioLogado');
        navigate('/login');
    };

    // ===================================
    // CRUD Cursos
    // ===================================
    const handleSaveCurso = async (e: React.FormEvent) => {
        e.preventDefault();
        const catId = cursoForm.ID_Categoria || (categorias.length > 0 ? categorias[0].ID_Categoria : 1);
        const novoCurso = new Curso(cursoForm.ID_Curso, cursoForm.Titulo, cursoForm.Descricao, admin.ID_Usuario, catId, cursoForm.Nivel, null, 0, 0, cursoForm.ImgUrl);
        if (cursoForm.ID_Curso && cursoForm.ID_Curso !== 0 && cursoForm.ID_Curso !== '0') {
            await ServicoArmazenamento.update('Cursos', 'ID_Curso', cursoForm.ID_Curso, novoCurso);
        } else {
            await ServicoArmazenamento.insert('Cursos', novoCurso);
        }
        setShowCursoModal(false);
        await loadDados();
        setCursoForm({ ID_Curso: 0, Titulo: '', Descricao: '', ID_Categoria: 1, Nivel: 'Iniciante', ImgUrl: '' });
    };

    const openEditCurso = (c: any) => {
        setCursoForm({ ID_Curso: c.id || c.ID_Curso, Titulo: c.Titulo, Descricao: c.Descricao, ID_Categoria: c.ID_Categoria, Nivel: c.Nivel, ImgUrl: c.ImgUrl || '' });
        setShowCursoModal(true);
    };

    const handleDeleteCurso = async (id: number) => {
        if (window.confirm('Deseja excluir este curso?')) {
            await ServicoArmazenamento.delete('Cursos', 'ID_Curso', id);
            await loadDados();
        }
    };
    
    const openConteudoCurso = async (c: any) => {
        setCursoSelecionado(c);
        setFiltroModuloId('todos');
        await loadConteudoCurso(c.ID_Curso);
        setShowConteudoModal(true);
    };
    
    const loadConteudoCurso = async (idCurso: number) => {
        const mods = await ServicoArmazenamento.getByProperty('Modulos', 'ID_Curso', idCurso);
        mods.sort((a, b) => a.Ordem - b.Ordem);
        setModulosCurso(mods);
        setModuloForm(prev => ({ ...prev, Ordem: mods.length > 0 ? mods[mods.length - 1].Ordem + 1 : 1 }));
        
        const aulasTemp: any[] = [];
        for (const m of mods) {
            const aulasM = await ServicoArmazenamento.getByProperty('Aulas', 'ID_Modulo', m.ID_Modulo);
            aulasM.sort((a, b) => a.Ordem - b.Ordem);
            aulasTemp.push(...aulasM);
        }
        setAulasCurso(aulasTemp);
    };

    const handleAddModulo = async () => {
        if (!moduloForm.Titulo) return;
        await ServicoArmazenamento.insert('Modulos', { ID_Modulo: 0, ID_Curso: cursoSelecionado.ID_Curso, Titulo: moduloForm.Titulo, Ordem: moduloForm.Ordem });
        setModuloForm({ Titulo: '', Ordem: 1 });
        await loadConteudoCurso(cursoSelecionado.ID_Curso);
    };
    
    const handleAddAula = async () => {
        if (!aulaForm.Titulo || aulaForm.ID_Modulo === -1) return;
        await ServicoArmazenamento.insert('Aulas', { ID_Aula: 0, ID_Modulo: aulaForm.ID_Modulo, Titulo: aulaForm.Titulo, TipoConteudo: aulaForm.TipoConteudo, DuracaoMinutos: aulaForm.DuracaoMinutos, Ordem: aulaForm.Ordem });
        setAulaForm({ ID_Modulo: -1, Titulo: '', TipoConteudo: 'Video', DuracaoMinutos: 10, Ordem: 1 });
        await loadConteudoCurso(cursoSelecionado.ID_Curso);
    };

    // ===================================
    // CRUD Categorias
    // ===================================
    const handleSaveCategoria = async (e: React.FormEvent) => {
        e.preventDefault();
        const novaCat = new Categoria(categoriaForm.ID_Categoria, categoriaForm.Nome, categoriaForm.Descricao);
        if (categoriaForm.ID_Categoria && categoriaForm.ID_Categoria !== 0 && categoriaForm.ID_Categoria !== '0') {
            await ServicoArmazenamento.update('Categorias', 'ID_Categoria', categoriaForm.ID_Categoria, novaCat);
        } else {
            await ServicoArmazenamento.insert('Categorias', novaCat);
        }
        setShowCategoriaModal(false);
        await loadDados();
        setCategoriaForm({ ID_Categoria: 0, Nome: '', Descricao: '' });
    };

    const openEditCategoria = (c: any) => {
        setCategoriaForm({ ID_Categoria: c.id || c.ID_Categoria, Nome: c.Nome, Descricao: c.Descricao });
        setShowCategoriaModal(true);
    };

    const handleDeleteCategoria = async (id: number) => {
        if (window.confirm('Deseja excluir esta categoria?')) {
            await ServicoArmazenamento.delete('Categorias', 'ID_Categoria', id);
            await loadDados();
        }
    };

    // ===================================
    // CRUD Trilhas
    // ===================================
    const handleSaveTrilha = async (e: React.FormEvent) => {
        e.preventDefault();
        const catId = trilhaForm.ID_Categoria || (categorias.length > 0 ? categorias[0].ID_Categoria : 1);
        const novaTrilha = new Trilha(trilhaForm.ID_Trilha, trilhaForm.Titulo, trilhaForm.Descricao, catId);
        
        let targetTrilhaId = trilhaForm.ID_Trilha;
        if (trilhaForm.ID_Trilha && trilhaForm.ID_Trilha !== 0 && trilhaForm.ID_Trilha !== '0') {
            await ServicoArmazenamento.update('Trilhas', 'ID_Trilha', trilhaForm.ID_Trilha, novaTrilha);
            
            // Delete antigos
            const antigos = await ServicoArmazenamento.getByProperty('Trilhas_Cursos', 'ID_Trilha', trilhaForm.ID_Trilha);
            for (const ant of antigos) {
                // Necessita delete por ID se houver, json-server deleta por ID. LocalStorage também. 
                // Assumindo que Trilhas_Cursos tem ID_TrilhaCurso ou deletamos de forma custom.
                // Como não tem PK simples, a gente vai recriar.
                // Se for LocalStorage é facil, mas no json-server o ideal é deletar um por um pelo 'id'.
                if(ant.id) await ServicoArmazenamento.delete('Trilhas_Cursos', 'id', ant.id);
            }
        } else {
            const savedTrilha = await ServicoArmazenamento.insert('Trilhas', novaTrilha);
            targetTrilhaId = savedTrilha.ID_Trilha || savedTrilha.id;
        }

        for (let i = 0; i < trilhaForm.cursosSelecionados.length; i++) {
            await ServicoArmazenamento.insert('Trilhas_Cursos', new TrilhaCurso(targetTrilhaId, trilhaForm.cursosSelecionados[i], i + 1));
        }

        setShowTrilhaModal(false);
        await loadDados();
        setTrilhaForm({ ID_Trilha: 0, Titulo: '', Descricao: '', ID_Categoria: 1, cursosSelecionados: [] });
    };

    const openEditTrilha = async (t: any) => {
        const cursosRelacionados = await ServicoArmazenamento.getByProperty('Trilhas_Cursos', 'ID_Trilha', t.id || t.ID_Trilha);
        const selIds = cursosRelacionados.map((rc: any) => rc.ID_Curso);
        setTrilhaForm({ ID_Trilha: t.id || t.ID_Trilha, Titulo: t.Titulo, Descricao: t.Descricao, ID_Categoria: t.ID_Categoria, cursosSelecionados: selIds });
        setShowTrilhaModal(true);
    };

    const handleDeleteTrilha = async (id: number) => {
        if (window.confirm('Deseja excluir esta trilha?')) {
            await ServicoArmazenamento.delete('Trilhas', 'ID_Trilha', id);
            await loadDados();
        }
    };

    // ===================================
    // CRUD Carreiras
    // ===================================
    const handleSaveCarreira = async (e: React.FormEvent) => {
        e.preventDefault();
        const novaCarreira = new Carreira(carreiraForm.ID_Carreira, carreiraForm.Titulo, carreiraForm.Descricao);
        
        let targetCarreiraId = carreiraForm.ID_Carreira;
        if (carreiraForm.ID_Carreira && carreiraForm.ID_Carreira !== 0 && carreiraForm.ID_Carreira !== '0') {
            await ServicoArmazenamento.update('Carreiras', 'ID_Carreira', carreiraForm.ID_Carreira, novaCarreira);
            
            const antigos = await ServicoArmazenamento.getByProperty('Carreiras_Trilhas', 'ID_Carreira', carreiraForm.ID_Carreira);
            for (const ant of antigos) {
                if(ant.id) await ServicoArmazenamento.delete('Carreiras_Trilhas', 'id', ant.id);
            }
        } else {
            const savedCarreira = await ServicoArmazenamento.insert('Carreiras', novaCarreira);
            targetCarreiraId = savedCarreira.ID_Carreira || savedCarreira.id;
        }

        for (let i = 0; i < carreiraForm.trilhasSelecionadas.length; i++) {
            await ServicoArmazenamento.insert('Carreiras_Trilhas', new CarreiraTrilha(targetCarreiraId, carreiraForm.trilhasSelecionadas[i], i + 1));
        }

        setShowCarreiraModal(false);
        await loadDados();
        setCarreiraForm({ ID_Carreira: 0, Titulo: '', Descricao: '', trilhasSelecionadas: [] });
    };

    const openEditCarreira = async (c: any) => {
        const trilhasRelacionadas = await ServicoArmazenamento.getByProperty('Carreiras_Trilhas', 'ID_Carreira', c.id || c.ID_Carreira);
        const selIds = trilhasRelacionadas.map((rc: any) => rc.ID_Trilha);
        setCarreiraForm({ ID_Carreira: c.id || c.ID_Carreira, Titulo: c.Titulo, Descricao: c.Descricao, trilhasSelecionadas: selIds });
        setShowCarreiraModal(true);
    };

    const handleDeleteCarreira = async (id: number) => {
        if (window.confirm('Deseja excluir esta carreira?')) {
            await ServicoArmazenamento.delete('Carreiras', 'ID_Carreira', id);
            await loadDados();
        }
    };

    // ===================================
    // CRUD Planos
    // ===================================
    const handleSavePlano = async (e: React.FormEvent) => {
        e.preventDefault();
        const pAtualizado = { ID_Plano: planoForm.ID_Plano, Nome: planoForm.Nome, Descricao: planoForm.Descricao, Preco: Number(planoForm.Preco), DuracaoMeses: Number(planoForm.DuracaoMeses) };
        if (planoForm.ID_Plano && planoForm.ID_Plano !== 0 && planoForm.ID_Plano !== '0') {
            await ServicoArmazenamento.update('Planos', 'ID_Plano', planoForm.ID_Plano, pAtualizado);
        } else {
            await ServicoArmazenamento.insert('Planos', pAtualizado);
        }
        setShowPlanoModal(false);
        await loadDados();
    };

    const openEditPlano = (p: any) => {
        setPlanoForm({ ID_Plano: p.id || p.ID_Plano, Nome: p.Nome, Descricao: p.Descricao, Preco: p.Preco, DuracaoMeses: p.DuracaoMeses });
        setShowPlanoModal(true);
    };

    // ===================================
    // Usuários
    // ===================================
    const handleDeleteUsuario = async (id: number) => {
        if (id === admin.ID_Usuario) {
            alert('Você não pode excluir sua própria conta enquanto está logado.');
            return;
        }
        if (window.confirm('Deseja realmente excluir este usuário?')) {
            await ServicoArmazenamento.delete('Usuarios', 'ID_Usuario', id);
            await loadDados();
        }
    };

    const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' };
    const modalContentStyle: React.CSSProperties = { backgroundColor: 'var(--dark-card)', padding: '20px', borderRadius: '10px', width: '100%', maxWidth: '600px', border: '1px solid var(--border-color)', color: 'var(--text-main)', maxHeight: '90vh', overflowY: 'auto' };

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
                                                {cursos.map((c, index) => (
                                                    <tr key={c.id || `${c.ID_Curso}-${index}`}>
                                                        <td>{c.ID_Curso}</td>
                                                        <td>{c.Titulo}</td>
                                                        <td>{c.Nivel}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-info me-2" onClick={() => openConteudoCurso(c)}><i className="bi bi-list"></i> Conteúdo</button>
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
                                                {categorias.length === 0 && <tr><td colSpan={4} className="text-center">Nenhuma categoria cadastrada.</td></tr>}
                                                {categorias.map((c, index) => (
                                                    <tr key={c.id || `${c.ID_Categoria}-${index}`}>
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
                                                {trilhas.map((t, index) => (
                                                    <tr key={t.id || `${t.ID_Trilha}-${index}`}>
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
                                                {carreiras.map((c, index) => (
                                                    <tr key={c.id || `${c.ID_Carreira}-${index}`}>
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
                                    <button className="btn btn-primary" onClick={() => { setPlanoForm({ ID_Plano: 0, Nome: '', Descricao: '', Preco: 0, DuracaoMeses: 1 }); setShowPlanoModal(true); }}>+ Novo Plano</button>
                                </div>
                                <div className="card card-custom p-0 overflow-hidden">
                                    <div className="table-responsive">
                                        <table className="table table-dark table-hover mb-0">
                                            <thead><tr><th>ID</th><th>Nome</th><th>Preço</th><th>Ações</th></tr></thead>
                                            <tbody>
                                                {planos.map((p, index) => (
                                                    <tr key={p.id || `${p.ID_Plano}-${index}`}>
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
                                                {usuarios.map((u, index) => (
                                                    <tr key={u.id || `${u.ID_Usuario}-${index}`}>
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
                        <h4 className="mb-4">{cursoForm.ID_Curso && cursoForm.ID_Curso !== 0 && cursoForm.ID_Curso !== '0' ? 'Editar Curso' : 'Cadastrar Novo Curso'}</h4>
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
            
            {/* Modal Conteúdo do Curso (Módulos e Aulas) */}
            {showConteudoModal && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, maxWidth: '800px' }}>
                        <div className="d-flex justify-content-between mb-4">
                            <h4>Conteúdo: {cursoSelecionado?.Titulo}</h4>
                            <button className="btn-close btn-close-white" onClick={() => setShowConteudoModal(false)}></button>
                        </div>
                        
                        <div className="row">
                            <div className="col-md-6 border-end border-secondary">
                                <h5>Módulos</h5>
                                <div className="mb-3 d-flex align-items-end gap-2">
                                    <div className="w-100">
                                        <small className="text-muted">Título do Módulo</small>
                                        <input type="text" className="form-control form-control-sm" placeholder="Título Módulo" value={moduloForm.Titulo} onChange={e => setModuloForm({...moduloForm, Titulo: e.target.value})} />
                                    </div>
                                    <div>
                                        <small className="text-muted">Ordem</small>
                                        <input type="number" className="form-control form-control-sm" placeholder="Ordem" style={{ width: '70px' }} value={moduloForm.Ordem} onChange={e => setModuloForm({...moduloForm, Ordem: Number(e.target.value)})} />
                                    </div>
                                    <button className="btn btn-sm btn-primary" onClick={handleAddModulo}>Adicionar</button>
                                </div>
                                <ul className="list-group list-group-flush mb-4">
                                    {modulosCurso.map((m: any) => (
                                        <li key={m.ID_Modulo} className="list-group-item bg-transparent text-white border-secondary">
                                            {m.Ordem} - {m.Titulo}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="col-md-6">
                                <h5>Aulas</h5>
                                <div className="mb-2">
                                    <select className="form-select form-select-sm mb-2" value={aulaForm.ID_Modulo} onChange={e => setAulaForm({...aulaForm, ID_Modulo: Number(e.target.value)})}>
                                        <option value={-1}>Selecione o Módulo</option>
                                        {modulosCurso.map((m: any) => <option key={m.ID_Modulo} value={m.ID_Modulo}>{m.Titulo}</option>)}
                                    </select>
                                    <input type="text" className="form-control form-control-sm mb-2" placeholder="Título da Aula" value={aulaForm.Titulo} onChange={e => setAulaForm({...aulaForm, Titulo: e.target.value})} />
                                    <div className="d-flex gap-2 mb-2">
                                        <div className="w-50">
                                            <small className="text-muted">Duração (Min)</small>
                                            <input type="number" className="form-control form-control-sm" placeholder="Minutos" value={aulaForm.DuracaoMinutos} onChange={e => setAulaForm({...aulaForm, DuracaoMinutos: Number(e.target.value)})} title="Duração da aula em minutos" />
                                        </div>
                                        <div className="w-50">
                                            <small className="text-muted">Ordem na Lista</small>
                                            <input type="number" className="form-control form-control-sm" placeholder="Ordem" value={aulaForm.Ordem} onChange={e => setAulaForm({...aulaForm, Ordem: Number(e.target.value)})} title="Posição da aula no módulo" />
                                        </div>
                                    </div>
                                    <button className="btn btn-sm btn-primary w-100" onClick={handleAddAula}>Adicionar Aula</button>
                                </div>
                                
                                <div className="d-flex align-items-center mb-2 mt-4 border-top border-secondary pt-3">
                                    <small className="text-muted me-2" style={{ whiteSpace: 'nowrap' }}>Filtrar lista:</small>
                                    <select className="form-select form-select-sm" value={filtroModuloId} onChange={e => setFiltroModuloId(e.target.value)}>
                                        <option value="todos">Todos os Módulos</option>
                                        {modulosCurso.map((m: any) => <option key={m.ID_Modulo} value={String(m.ID_Modulo)}>{m.Titulo}</option>)}
                                    </select>
                                </div>
                                
                                <ul className="list-group list-group-flush" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {aulasCurso.filter(a => filtroModuloId === 'todos' || String(a.ID_Modulo) === filtroModuloId).map((a: any, index: number) => {
                                        const mod = modulosCurso.find(m => String(m.ID_Modulo) === String(a.ID_Modulo));
                                        return (
                                        <li key={a.id || `${a.ID_Aula}-${index}`} className="list-group-item bg-transparent text-white border-secondary d-flex justify-content-between">
                                            <small>{a.Titulo} ({a.DuracaoMinutos}m)</small>
                                            <span className="badge bg-secondary">Módulo {mod ? mod.Ordem : '?'}</span>
                                        </li>
                                    )})}
                                    {aulasCurso.filter(a => filtroModuloId === 'todos' || String(a.ID_Modulo) === filtroModuloId).length === 0 && (
                                        <li className="list-group-item bg-transparent text-muted text-center border-secondary"><small>Nenhuma aula neste módulo.</small></li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nova/Editar Categoria */}
            {showCategoriaModal && (
                <div style={modalOverlayStyle}>
                    <form style={modalContentStyle} onSubmit={handleSaveCategoria}>
                        <h4 className="mb-4">{categoriaForm.ID_Categoria && categoriaForm.ID_Categoria !== 0 && categoriaForm.ID_Categoria !== '0' ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}</h4>
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
                        <h4 className="mb-4">{carreiraForm.ID_Carreira && carreiraForm.ID_Carreira !== 0 && carreiraForm.ID_Carreira !== '0' ? 'Editar Carreira' : 'Cadastrar Nova Carreira'}</h4>
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
                        <h4 className="mb-4">{trilhaForm.ID_Trilha && trilhaForm.ID_Trilha !== 0 && trilhaForm.ID_Trilha !== '0' ? 'Editar Trilha' : 'Cadastrar Nova Trilha'}</h4>
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
                        <h4 className="mb-4">{planoForm.ID_Plano && planoForm.ID_Plano !== 0 && planoForm.ID_Plano !== '0' ? 'Editar Plano' : 'Cadastrar Novo Plano'}</h4>
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
