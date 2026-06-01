import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServicoArmazenamento } from '../../services/ServicoArmazenamento';
import { Matricula } from '../../models/Entidades';

export const PainelAlunoPages = () => {
    const navigate = useNavigate();
    const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
    
    // Dados do usuário
    const [matriculas, setMatriculas] = useState<any[]>([]);
    const [minhasTrilhas, setMinhasTrilhas] = useState<any[]>([]);
    const [minhasCarreiras, setMinhasCarreiras] = useState<any[]>([]);
    const [assinatura, setAssinatura] = useState<any>(null);
    
    // Catálogo
    const [cursosDisponiveis, setCursosDisponiveis] = useState<any[]>([]);
    const [trilhasDisponiveis, setTrilhasDisponiveis] = useState<any[]>([]);
    const [carreirasDisponiveis, setCarreirasDisponiveis] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState('meus-cursos');
    const [showModal, setShowModal] = useState(false);
    const [modalTab, setModalTab] = useState('cursos');

    useEffect(() => {
        const userJson = localStorage.getItem('usuarioLogado');
        if (!userJson) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userJson);
        setUsuarioLogado(user);

        ServicoArmazenamento.init();
        loadData(user.ID_Usuario);
    }, [navigate]);

    // Função de progresso simulado
    const getProgressoCurso = (idCurso: number, idUsuario: number) => {
        // Mock consistente baseado nos IDs
        return ((idCurso * 37) + (idUsuario * 13)) % 100;
    };

    const loadData = (userId: number) => {
        const mats = ServicoArmazenamento.getByProperty('Matriculas', 'ID_Usuario', userId);
        const todosCursos = ServicoArmazenamento.getAll('Cursos');
        const todasTrilhas = ServicoArmazenamento.getAll('Trilhas');
        const todasCarreiras = ServicoArmazenamento.getAll('Carreiras');
        const trilhaCursos = ServicoArmazenamento.getAll('Trilhas_Cursos');
        const carreiraTrilhas = ServicoArmazenamento.getAll('Carreiras_Trilhas');
        
        const cursosJaMatriculadosIds = mats.map(m => m.ID_Curso);

        // 1. Mapear Meus Cursos com Progresso
        const matriculasDetalhes = mats.map(m => {
            const curso = todosCursos.find(c => c.ID_Curso === m.ID_Curso);
            const prog = getProgressoCurso(m.ID_Curso, userId);
            return { ...m, Curso: curso, Progresso: prog };
        });
        setMatriculas(matriculasDetalhes);

        const matsTrilhas = ServicoArmazenamento.getByProperty('Matriculas_Trilhas', 'ID_Usuario', userId).map((m: any) => m.ID_Trilha);
        const matsCarreiras = ServicoArmazenamento.getByProperty('Matriculas_Carreiras', 'ID_Usuario', userId).map((m: any) => m.ID_Carreira);

        // 2. Mapear Minhas Trilhas
        const alunoTrilhas: any[] = [];
        const trilhasRestantes: any[] = [];

        todasTrilhas.forEach(trilha => {
            if (matsTrilhas.includes(trilha.ID_Trilha)) {
                const cursosDaTrilha = trilhaCursos.filter((tc: any) => tc.ID_Trilha === trilha.ID_Trilha).map((tc: any) => tc.ID_Curso);
                let progressoTrilha = 0;
                if (cursosDaTrilha.length > 0) {
                    let somaProgresso = 0;
                    cursosDaTrilha.forEach((cId: number) => {
                        if (cursosJaMatriculadosIds.includes(cId)) somaProgresso += getProgressoCurso(cId, userId);
                    });
                    progressoTrilha = Math.floor(somaProgresso / cursosDaTrilha.length);
                }
                alunoTrilhas.push({ ...trilha, Progresso: progressoTrilha });
            } else {
                trilhasRestantes.push(trilha);
            }
        });
        setMinhasTrilhas(alunoTrilhas);
        setTrilhasDisponiveis(trilhasRestantes);

        // 3. Mapear Minhas Carreiras
        const alunoCarreiras: any[] = [];
        const carreirasRestantes: any[] = [];

        todasCarreiras.forEach(carreira => {
            if (matsCarreiras.includes(carreira.ID_Carreira)) {
                const trilhasDaCarreira = carreiraTrilhas.filter((ct: any) => ct.ID_Carreira === carreira.ID_Carreira).map((ct: any) => ct.ID_Trilha);
                let progressoCarreira = 0;
                if (trilhasDaCarreira.length > 0) {
                    let somaProgresso = 0;
                    trilhasDaCarreira.forEach((tId: number) => {
                        const tInscrita = alunoTrilhas.find(at => at.ID_Trilha === tId);
                        if (tInscrita) somaProgresso += tInscrita.Progresso;
                    });
                    progressoCarreira = Math.floor(somaProgresso / trilhasDaCarreira.length);
                }
                alunoCarreiras.push({ ...carreira, Progresso: progressoCarreira });
            } else {
                carreirasRestantes.push(carreira);
            }
        });
        setMinhasCarreiras(alunoCarreiras);
        setCarreirasDisponiveis(carreirasRestantes);

        // Cursos não matriculados
        setCursosDisponiveis(todosCursos.filter(c => !cursosJaMatriculadosIds.includes(c.ID_Curso)));

        // Assinatura
        const assins = ServicoArmazenamento.getByProperty('Assinaturas', 'ID_Usuario', userId);
        if (assins.length > 0) {
            const planoId = assins[0].ID_Plano;
            const plan = ServicoArmazenamento.getById('Planos', 'ID_Plano', planoId);
            setAssinatura({ ...assins[0], Plano: plan });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('usuarioLogado');
        navigate('/login');
    };

    const simularMatriculaCurso = (idCurso: number) => {
        if (!usuarioLogado) return;
        const mats = ServicoArmazenamento.getByProperty('Matriculas', 'ID_Usuario', usuarioLogado.ID_Usuario);
        if (!mats.some(m => m.ID_Curso === idCurso)) {
            const novaMat = new Matricula(0, usuarioLogado.ID_Usuario, idCurso);
            ServicoArmazenamento.insert('Matriculas', novaMat);
        }
    };

    const inscreverCurso = (idCurso: number) => {
        simularMatriculaCurso(idCurso);
        loadData(usuarioLogado.ID_Usuario);
        setShowModal(false);
    };

    const inscreverTrilha = (idTrilha: number) => {
        if (!usuarioLogado) return;
        
        // Registrar matricula específica na Trilha
        const matsTrilha = ServicoArmazenamento.getByProperty('Matriculas_Trilhas', 'ID_Usuario', usuarioLogado.ID_Usuario);
        if (!matsTrilha.some(m => m.ID_Trilha === idTrilha)) {
            ServicoArmazenamento.insert('Matriculas_Trilhas', { ID_MatriculaTrilha: 0, ID_Usuario: usuarioLogado.ID_Usuario, ID_Trilha: idTrilha });
        }

        const cursosDaTrilha = ServicoArmazenamento.getByProperty('Trilhas_Cursos', 'ID_Trilha', idTrilha).map((tc: any) => tc.ID_Curso);
        if (cursosDaTrilha.length === 0) {
            alert('Esta trilha ainda não possui cursos vinculados pelo Administrador.');
        } else {
            cursosDaTrilha.forEach((idCurso: number) => simularMatriculaCurso(idCurso));
        }
        
        loadData(usuarioLogado.ID_Usuario);
        setShowModal(false);
    };

    const inscreverCarreira = (idCarreira: number) => {
        if (!usuarioLogado) return;

        // Registrar matricula específica na Carreira
        const matsCarreira = ServicoArmazenamento.getByProperty('Matriculas_Carreiras', 'ID_Usuario', usuarioLogado.ID_Usuario);
        if (!matsCarreira.some(m => m.ID_Carreira === idCarreira)) {
            ServicoArmazenamento.insert('Matriculas_Carreiras', { ID_MatriculaCarreira: 0, ID_Usuario: usuarioLogado.ID_Usuario, ID_Carreira: idCarreira });
        }

        const trilhasDaCarreira = ServicoArmazenamento.getByProperty('Carreiras_Trilhas', 'ID_Carreira', idCarreira).map((ct: any) => ct.ID_Trilha);
        if (trilhasDaCarreira.length === 0) {
            alert('Esta carreira ainda não possui trilhas vinculadas pelo Administrador.');
        } else {
            let encontrouCursos = false;
            trilhasDaCarreira.forEach((idTrilha: number) => {
                const cursosDaTrilha = ServicoArmazenamento.getByProperty('Trilhas_Cursos', 'ID_Trilha', idTrilha).map((tc: any) => tc.ID_Curso);
                if (cursosDaTrilha.length > 0) encontrouCursos = true;
                
                // Inscrever na trilha recursivamente também garante a hierarquia
                const matsTrilha = ServicoArmazenamento.getByProperty('Matriculas_Trilhas', 'ID_Usuario', usuarioLogado.ID_Usuario);
                if (!matsTrilha.some(m => m.ID_Trilha === idTrilha)) {
                    ServicoArmazenamento.insert('Matriculas_Trilhas', { ID_MatriculaTrilha: 0, ID_Usuario: usuarioLogado.ID_Usuario, ID_Trilha: idTrilha });
                }
                cursosDaTrilha.forEach((idCurso: number) => simularMatriculaCurso(idCurso));
            });

            if (!encontrouCursos) {
                alert('As trilhas desta carreira ainda não possuem cursos vinculados.');
            }
        }

        loadData(usuarioLogado.ID_Usuario);
        setShowModal(false);
    };

    const cancelarMatriculaCurso = (idCurso: number) => {
        if (!usuarioLogado) return;
        if (window.confirm('Deseja realmente cancelar a inscrição neste curso?')) {
            const mats = ServicoArmazenamento.getByProperty('Matriculas', 'ID_Usuario', usuarioLogado.ID_Usuario);
            const mat = mats.find(m => m.ID_Curso === idCurso);
            if (mat) {
                ServicoArmazenamento.delete('Matriculas', 'ID_Matricula', mat.ID_Matricula);
                loadData(usuarioLogado.ID_Usuario);
            }
        }
    };

    const cancelarMatriculaTrilha = (idTrilha: number) => {
        if (!usuarioLogado) return;
        if (window.confirm('Deseja cancelar a inscrição nesta trilha? (Você continuará com o acesso aos cursos dela, mas a trilha não aparecerá mais no seu painel)')) {
            const mats = ServicoArmazenamento.getByProperty('Matriculas_Trilhas', 'ID_Usuario', usuarioLogado.ID_Usuario);
            const mat = mats.find(m => m.ID_Trilha === idTrilha);
            if (mat) {
                ServicoArmazenamento.delete('Matriculas_Trilhas', 'ID_MatriculaTrilha', mat.ID_MatriculaTrilha);
                loadData(usuarioLogado.ID_Usuario);
            }
        }
    };

    const cancelarMatriculaCarreira = (idCarreira: number) => {
        if (!usuarioLogado) return;
        if (window.confirm('Deseja cancelar a inscrição nesta carreira? (Você continuará com o acesso aos cursos e trilhas individualmente)')) {
            const mats = ServicoArmazenamento.getByProperty('Matriculas_Carreiras', 'ID_Usuario', usuarioLogado.ID_Usuario);
            const mat = mats.find(m => m.ID_Carreira === idCarreira);
            if (mat) {
                ServicoArmazenamento.delete('Matriculas_Carreiras', 'ID_MatriculaCarreira', mat.ID_MatriculaCarreira);
                loadData(usuarioLogado.ID_Usuario);
            }
        }
    };

    const ProgressBar = ({ progress }: { progress: number }) => (
        <div className="mt-3">
            <div className="d-flex justify-content-between mb-1">
                <small className="text-muted fw-bold">Progresso</small>
                <small className="text-success fw-bold">{progress}%</small>
            </div>
            <div className="progress" style={{ height: '8px', backgroundColor: 'var(--border-color)' }}>
                <div className="progress-bar bg-success" role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}></div>
            </div>
        </div>
    );

    return (
        <div style={{ backgroundColor: 'var(--dark-bg)', minHeight: '100vh' }}>
            <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top" style={{ backgroundColor: 'var(--dark-card)', borderBottom: '1px solid var(--border-color)' }}>
                <div className="container pb-2 pt-2">
                    <Link className="navbar-brand" to="/">Forma<span>Pro</span></Link>
                    
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#alunoNavbar">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="alunoNavbar">
                        <ul className="navbar-nav mx-auto gap-2 text-center mt-3 mt-lg-0">
                            <li className="nav-item">
                                <button className={`nav-link bg-transparent border-0 fw-bold ${activeTab === 'meus-cursos' ? 'active text-primary border-bottom border-primary border-3' : 'text-white'}`} onClick={() => setActiveTab('meus-cursos')}>Cursos Individuais</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link bg-transparent border-0 fw-bold ${activeTab === 'minhas-trilhas' ? 'active text-primary border-bottom border-primary border-3' : 'text-white'}`} onClick={() => setActiveTab('minhas-trilhas')}>Minhas Trilhas</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link bg-transparent border-0 fw-bold ${activeTab === 'minhas-carreiras' ? 'active text-primary border-bottom border-primary border-3' : 'text-white'}`} onClick={() => setActiveTab('minhas-carreiras')}>Minhas Carreiras</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link bg-transparent border-0 fw-bold ${activeTab === 'meu-plano' ? 'active text-primary border-bottom border-primary border-3' : 'text-white'}`} onClick={() => setActiveTab('meu-plano')}>Meu Plano</button>
                            </li>
                        </ul>

                        <div className="d-flex align-items-center justify-content-center mt-3 mt-lg-0">
                            <span className="text-white me-3 d-none d-xl-inline" id="user-greeting">
                                Olá, {usuarioLogado?.NomeCompleto || 'Aluno'}
                            </span>
                            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Sair</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mt-4">

                <div className="row mb-5">
                    <div className="col-12">
                        <div className="card card-custom p-4 bg-primary-custom text-white border-0" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)' }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 className="fw-bold">Continue Seu Aprendizado</h2>
                                    <p className="mb-0 text-white-50">Confira abaixo suas trilhas, carreiras e cursos. Acompanhe seu progresso!</p>
                                </div>
                                <button className="btn btn-light fw-bold px-4 py-2" onClick={() => setShowModal(true)}>
                                    <i className="bi bi-plus-circle me-2"></i> Adicionar Cursos/Trilhas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Abas agora no cabeçalho */}

                <div className="tab-content">
                    {/* Cursos */}
                    {activeTab === 'meus-cursos' && (
                        <div className="tab-pane fade show active">
                            <h4 className="mb-4" style={{ color: 'var(--text-main)' }}>Meus Cursos</h4>
                            <div className="row g-4">
                                {matriculas.length === 0 ? (
                                    <div className="col-12 text-center text-muted py-5"><p>Você ainda não está matriculado em nenhum curso.</p></div>
                                ) : (
                                    matriculas.map(mat => (
                                        <div className="col-md-4" key={mat.ID_Matricula}>
                                            <div className="card card-custom h-100">
                                                <div className="card-body d-flex flex-column">
                                                    <h5 className="card-title fw-bold text-primary-custom">{mat.Curso?.Titulo}</h5>
                                                    <ProgressBar progress={mat.Progresso} />
                                                    <div className="mt-auto pt-3 d-flex gap-2">
                                                        <Link to={`/sala_aula?curso=${mat.ID_Curso}`} className="btn btn-primary flex-grow-1">Acessar</Link>
                                                        <button className="btn btn-outline-danger px-3 fw-bold" title="Cancelar Inscrição" onClick={() => cancelarMatriculaCurso(mat.ID_Curso)}>
                                                            X
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Trilhas */}
                    {activeTab === 'minhas-trilhas' && (
                        <div className="tab-pane fade show active">
                            <h4 className="mb-4" style={{ color: 'var(--text-main)' }}>Trilhas em Andamento</h4>
                            <div className="row g-4">
                                {minhasTrilhas.length === 0 ? (
                                    <div className="col-12 text-center text-muted py-5"><p>Você ainda não iniciou nenhuma trilha.</p></div>
                                ) : (
                                    minhasTrilhas.map(t => (
                                        <div className="col-md-4" key={t.ID_Trilha}>
                                            <div className="card card-custom h-100">
                                                <div className="card-body">
                                                    <h5 className="card-title fw-bold">{t.Titulo}</h5>
                                                    <p className="small text-muted">{t.Descricao}</p>
                                                    <ProgressBar progress={t.Progresso} />
                                                    <div className="mt-3 text-end">
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => cancelarMatriculaTrilha(t.ID_Trilha)}>
                                                            <i className="bi bi-x-circle me-1"></i> Sair da Trilha
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Carreiras */}
                    {activeTab === 'minhas-carreiras' && (
                        <div className="tab-pane fade show active">
                            <h4 className="mb-4" style={{ color: 'var(--text-main)' }}>Suas Carreiras</h4>
                            <div className="row g-4">
                                {minhasCarreiras.length === 0 ? (
                                    <div className="col-12 text-center text-muted py-5"><p>Você ainda não iniciou nenhuma carreira.</p></div>
                                ) : (
                                    minhasCarreiras.map(c => (
                                        <div className="col-md-4" key={c.ID_Carreira}>
                                            <div className="card card-custom h-100 border-primary">
                                                <div className="card-body">
                                                    <h5 className="card-title fw-bold text-warning">{c.Titulo}</h5>
                                                    <p className="small text-muted">{c.Descricao}</p>
                                                    <ProgressBar progress={c.Progresso} />
                                                    <div className="mt-3 text-end">
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => cancelarMatriculaCarreira(c.ID_Carreira)}>
                                                            <i className="bi bi-x-circle me-1"></i> Sair da Carreira
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Meu Plano */}
                    {activeTab === 'meu-plano' && (
                        <div className="tab-pane fade show active">
                            <h4 className="mb-4" style={{ color: 'var(--text-main)' }}>Minha Assinatura</h4>
                            {assinatura ? (
                                <div className="card card-custom p-4 border-success border-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="text-success fw-bold mb-1">{assinatura.Plano?.Nome}</h5>
                                            <p className="text-muted mb-0">Ativo desde: {new Date(assinatura.DataInicio).toLocaleDateString()}</p>
                                        </div>
                                        <span className="badge bg-success py-2 px-3">Plano Ativo</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted">Você ainda não possui um plano ativo. <Link to="/#planos">Assine agora</Link>.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Matricular (Explorar) */}
            {showModal && (
                <div className="modal d-block bg-dark bg-opacity-75" tabIndex={-1}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content" style={{ backgroundColor: 'var(--dark-card)' }}>
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title fw-bold" style={{ color: 'var(--text-main)' }}>Catálogo de Inscrições</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body border-secondary p-0">
                                
                                {/* Sub-Tabs do Modal */}
                                <ul className="nav nav-pills p-3 border-bottom border-secondary" style={{ gap: '10px' }}>
                                    <li className="nav-item"><button className={`nav-link ${modalTab === 'cursos' ? 'active bg-primary' : 'text-muted'}`} onClick={() => setModalTab('cursos')}>Cursos</button></li>
                                    <li className="nav-item"><button className={`nav-link ${modalTab === 'trilhas' ? 'active bg-primary' : 'text-muted'}`} onClick={() => setModalTab('trilhas')}>Trilhas</button></li>
                                    <li className="nav-item"><button className={`nav-link ${modalTab === 'carreiras' ? 'active bg-primary' : 'text-muted'}`} onClick={() => setModalTab('carreiras')}>Carreiras</button></li>
                                </ul>

                                <div className="p-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                    
                                    {modalTab === 'cursos' && (
                                        <div className="list-group">
                                            {cursosDisponiveis.length === 0 ? <p className="text-muted text-center py-3">Nenhum curso disponível para matrícula.</p> : cursosDisponiveis.map(curso => (
                                                <div className="list-group-item list-group-item-action bg-transparent border-secondary d-flex justify-content-between align-items-center mb-2" key={curso.ID_Curso} style={{ borderRadius: '8px', color: 'var(--text-main)' }}>
                                                    <div>
                                                        <h6 className="mb-1 fw-bold">{curso.Titulo}</h6>
                                                        <small className="text-muted">{curso.Nivel}</small>
                                                    </div>
                                                    <button className="btn btn-sm btn-outline-success fw-bold px-3" onClick={() => inscreverCurso(curso.ID_Curso)}>Inscrever-se</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {modalTab === 'trilhas' && (
                                        <div className="list-group">
                                            {trilhasDisponiveis.length === 0 ? <p className="text-muted text-center py-3">Nenhuma trilha disponível para matrícula.</p> : trilhasDisponiveis.map(trilha => (
                                                <div className="list-group-item list-group-item-action bg-transparent border-secondary d-flex justify-content-between align-items-center mb-2" key={trilha.ID_Trilha} style={{ borderRadius: '8px', color: 'var(--text-main)' }}>
                                                    <div>
                                                        <h6 className="mb-1 fw-bold text-primary-custom">{trilha.Titulo}</h6>
                                                        <small className="text-muted">{trilha.Descricao}</small>
                                                    </div>
                                                    <button className="btn btn-sm btn-outline-success fw-bold px-3" onClick={() => inscreverTrilha(trilha.ID_Trilha)}>Iniciar Trilha</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {modalTab === 'carreiras' && (
                                        <div className="list-group">
                                            {carreirasDisponiveis.length === 0 ? <p className="text-muted text-center py-3">Nenhuma carreira disponível para matrícula.</p> : carreirasDisponiveis.map(carreira => (
                                                <div className="list-group-item list-group-item-action bg-transparent border-secondary d-flex justify-content-between align-items-center mb-2" key={carreira.ID_Carreira} style={{ borderRadius: '8px', color: 'var(--text-main)' }}>
                                                    <div>
                                                        <h6 className="mb-1 fw-bold text-warning">{carreira.Titulo}</h6>
                                                        <small className="text-muted">{carreira.Descricao}</small>
                                                    </div>
                                                    <button className="btn btn-sm btn-outline-success fw-bold px-3" onClick={() => inscreverCarreira(carreira.ID_Carreira)}>Iniciar Carreira</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
