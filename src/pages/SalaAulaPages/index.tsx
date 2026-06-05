import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ServicoArmazenamento } from '../../services/ServicoArmazenamento';
import { ProgressoAula } from '../../models/Entidades';

export const SalaAulaPages = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
    const [curso, setCurso] = useState<any>(null);
    const [modulos, setModulos] = useState<any[]>([]);
    const [aulas, setAulas] = useState<any[]>([]);
    const [aulaAtual, setAulaAtual] = useState<any>(null);
    
    // Progresso Real
    const [progresso, setProgresso] = useState(0);
    const [aulasConcluidas, setAulasConcluidas] = useState<number[]>([]);

    useEffect(() => {
        const userJson = localStorage.getItem('usuarioLogado');
        if (!userJson) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userJson);
        setUsuarioLogado(user);

        const params = new URLSearchParams(location.search);
        const cursoId = params.get('curso');

        if (cursoId) {
            loadCourseData(parseInt(cursoId), user.ID_Usuario);
        }
    }, [navigate, location.search]);

    const loadCourseData = async (parsedId: number, userId: number) => {
        const c = await ServicoArmazenamento.getById('Cursos', 'ID_Curso', parsedId);
        setCurso(c);
        
        // Carrega modulos
        let mods = await ServicoArmazenamento.getByProperty('Modulos', 'ID_Curso', parsedId);
        if (mods.length === 0) {
            // Seed dinâmico se não existir
            const newMod = await ServicoArmazenamento.insert('Modulos', { ID_Modulo: 0, ID_Curso: parsedId, Titulo: 'Introdução', Ordem: 1 });
            await ServicoArmazenamento.insert('Aulas', { ID_Aula: 0, ID_Modulo: newMod.ID_Modulo, Titulo: 'Aula de Boas Vindas', TipoConteudo: 'Video', DuracaoMinutos: 10, Ordem: 1 });
            await ServicoArmazenamento.insert('Aulas', { ID_Aula: 0, ID_Modulo: newMod.ID_Modulo, Titulo: 'Visão Geral do Curso', TipoConteudo: 'Video', DuracaoMinutos: 15, Ordem: 2 });
            mods = await ServicoArmazenamento.getByProperty('Modulos', 'ID_Curso', parsedId);
        }
        
        setModulos(mods);
        
        // Pega aulas
        let todasAulas: any[] = [];
        for (const m of mods) {
            const a = await ServicoArmazenamento.getByProperty('Aulas', 'ID_Modulo', m.ID_Modulo);
            a.forEach((aulaItem: any) => {
                if (!todasAulas.some(existente => existente.ID_Aula === aulaItem.ID_Aula)) {
                    todasAulas.push(aulaItem);
                }
            });
        }
        setAulas(todasAulas);

        if (todasAulas.length > 0) {
            setAulaAtual(todasAulas[0]);
        }

        // Pega progresso
        const prgsRaw = await ServicoArmazenamento.getByProperty('Progresso_Aulas', 'ID_Usuario', userId);
        const concluidas = prgsRaw.filter((p: any) => p.Status === 'Concluído').map((p: any) => p.ID_Aula);
        
        // Filtra concluidas que pertencem apenas a este curso
        const concluidasDesteCurso = concluidas.filter((id: number) => todasAulas.some(a => a.ID_Aula === id));
        
        setAulasConcluidas(concluidasDesteCurso);
        
        if (todasAulas.length > 0) {
            setProgresso(Math.floor((concluidasDesteCurso.length / todasAulas.length) * 100));
        } else {
            setProgresso(0);
        }
    };

    const handleConcluirAula = async () => {
        if (!usuarioLogado || !aulaAtual || !curso) return;

        // Se já está concluída, não faz nada (poderia ter um toggle para desmarcar)
        if (aulasConcluidas.includes(aulaAtual.ID_Aula)) return;

        const novoProgresso = new ProgressoAula(usuarioLogado.ID_Usuario, aulaAtual.ID_Aula, new Date().toISOString(), 'Concluído');
        
        await ServicoArmazenamento.insert('Progresso_Aulas', novoProgresso);

        // Recalcular localmente para não precisar dar loadCourseData inteiro
        const novasConcluidas = [...aulasConcluidas, aulaAtual.ID_Aula];
        setAulasConcluidas(novasConcluidas);
        setProgresso(Math.floor((novasConcluidas.length / aulas.length) * 100));
    };

    const emitirCertificado = async () => {
        if (!usuarioLogado || !curso) return;
        
        // Verifica se o certificado já existe
        const certs = await ServicoArmazenamento.getByProperty('Certificados', 'ID_Usuario', usuarioLogado.ID_Usuario);
        const certExiste = certs.find((c: any) => c.ID_Curso === curso.ID_Curso);
        
        if (!certExiste) {
            // Gerar
            const hash = "CERT-" + curso.ID_Curso + "-" + usuarioLogado.ID_Usuario + "-" + Math.random().toString(36).substr(2, 5).toUpperCase();
            await ServicoArmazenamento.insert('Certificados', {
                ID_Certificado: 0,
                ID_Usuario: usuarioLogado.ID_Usuario,
                ID_Curso: curso.ID_Curso,
                ID_Trilha: null,
                CodigoVerificacao: hash,
                DataEmissao: new Date().toISOString()
            });
        }
        
        navigate(`/certificado?curso=${curso.ID_Curso}`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--dark-bg)' }}>
            <nav className="navbar navbar-dark py-3" style={{ backgroundColor: 'var(--dark-card)', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                <div className="container-fluid px-4 align-items-center">
                    <Link to="/painel_aluno" className="text-white text-decoration-none me-4">
                        <i className="bi bi-arrow-left"></i> Voltar
                    </Link>
                    <h5 className="mb-0 text-white fw-bold me-auto">{curso ? curso.Titulo : 'Curso Indisponível'}</h5>
                    
                    <div className="d-flex align-items-center d-none d-md-flex">
                        <span className="text-muted small me-3">{progresso}% Concluído</span>
                        <div className="progress" style={{ width: '150px', height: '8px', backgroundColor: 'var(--border-color)' }}>
                            <div className="progress-bar bg-success" role="progressbar" style={{ width: `${progresso}%` }}></div>
                        </div>
                        {progresso === 100 && (
                            <button onClick={emitirCertificado} className="btn btn-sm btn-outline-warning ms-4">
                                <i className="bi bi-award-fill"></i> Emitir Certificado
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Main Area (Video / Text) */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <div style={{ backgroundColor: '#000', width: '100%', aspectRatio: '16 / 9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <div className="text-center">
                            <i className="bi bi-play-circle display-1 text-muted"></i>
                            <p className="mt-3 text-muted">A reprodução de vídeo é simulada nesta demonstração.</p>
                        </div>
                    </div>
                    
                    <div className="p-4 p-md-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{aulaAtual ? aulaAtual.Titulo : 'Título da Aula'}</h2>
                            {aulaAtual && aulasConcluidas.includes(aulaAtual.ID_Aula) ? (
                                <button className="btn btn-success" disabled>
                                    <i className="bi bi-check-circle-fill"></i> Concluída
                                </button>
                            ) : (
                                <button className="btn btn-outline-success fw-bold" onClick={handleConcluirAula}>
                                    <i className="bi bi-check-circle"></i> Marcar como Concluída
                                </button>
                            )}
                        </div>
                        
                        <div className="card card-custom p-4 bg-transparent border-secondary border-opacity-25">
                            <h5 style={{ color: 'var(--text-main)' }} className="mb-3">Sobre esta aula</h5>
                            <p style={{ color: 'var(--text-muted)' }}>Descrição e materiais complementares simulados.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Grade Curricular */}
                <div style={{ width: '350px', flexShrink: 0, backgroundColor: 'var(--dark-card)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <div className="p-4 pb-3 border-bottom border-secondary">
                        <h5 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Conteúdo do Curso</h5>
                    </div>
                    
                    <div className="flex-grow-1">
                        {modulos.map((m, mIdx) => {
                            const aulasModulo = aulas.filter(a => String(a.ID_Modulo) === String(m.ID_Modulo));
                            if (aulasModulo.length === 0) return null;
                            
                            return (
                                <div key={m.id || m.ID_Modulo}>
                                    <div className="px-4 py-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                                        <small className="fw-bold text-uppercase" style={{ fontSize: '0.70rem', letterSpacing: '1px', color: 'var(--primary-color)' }}>Módulo {m.Ordem}</small>
                                        <div className="text-white fw-bold mt-1">{m.Titulo}</div>
                                    </div>
                                    <div className="list-group list-group-flush">
                                        {aulasModulo.map((aula, aIdx) => {
                                            const isConcluida = aulasConcluidas.includes(aula.ID_Aula);
                                            const isAtual = aulaAtual?.ID_Aula === aula.ID_Aula;
                                            return (
                                                <button 
                                                    key={aula.id || aula.ID_Aula} 
                                                    className={`list-group-item list-group-item-action py-3 px-4 ${isAtual ? 'active border-0' : 'bg-transparent border-0 border-bottom border-secondary'}`}
                                                    onClick={() => setAulaAtual(aula)}
                                                    style={{ 
                                                        color: isAtual ? '#fff' : 'var(--text-main)', 
                                                        backgroundColor: isAtual ? 'var(--primary-color)' : 'transparent',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span><small className="opacity-75 me-2">{aIdx + 1}.</small> {aula.Titulo}</span>
                                                        {isConcluida && <i className="bi bi-check-circle-fill" style={{ color: isAtual ? '#fff' : 'var(--success-color, #198754)' }}></i>}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
