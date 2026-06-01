import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ServicoArmazenamento } from '../../services/ServicoArmazenamento';

export const SalaAulaPages = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [curso, setCurso] = useState<any>(null);
    const [, setModulos] = useState<any[]>([]);
    const [aulas, setAulas] = useState<any[]>([]);
    const [aulaAtual, setAulaAtual] = useState<any>(null);
    const [progresso, setProgresso] = useState(0);

    useEffect(() => {
        const userJson = localStorage.getItem('usuarioLogado');
        if (!userJson) {
            navigate('/login');
            return;
        }

        ServicoArmazenamento.init();
        
        const params = new URLSearchParams(location.search);
        const cursoId = params.get('curso');

        if (cursoId) {
            const parsedId = parseInt(cursoId);
            const c = ServicoArmazenamento.getById('Cursos', 'ID_Curso', parsedId);
            setCurso(c);
            
            // Simulação de módulos e aulas se não existir
            let mods = ServicoArmazenamento.getByProperty('Modulos', 'ID_Curso', parsedId);
            if (mods.length === 0) {
                // Seed mock (removendo IDs fixos para auto-incrementar corretamente e não conflitar)
                const newMod = ServicoArmazenamento.insert('Modulos', { ID_Modulo: 0, ID_Curso: parsedId, Titulo: 'Introdução', Ordem: 1 });
                ServicoArmazenamento.insert('Aulas', { ID_Aula: 0, ID_Modulo: newMod.ID_Modulo, Titulo: 'Aula de Boas Vindas', TipoConteudo: 'Video', DuracaoMinutos: 10, Ordem: 1 });
                ServicoArmazenamento.insert('Aulas', { ID_Aula: 0, ID_Modulo: newMod.ID_Modulo, Titulo: 'Visão Geral do Curso', TipoConteudo: 'Video', DuracaoMinutos: 15, Ordem: 2 });
                mods = [newMod];
            }
            
            setModulos(mods);
            
            let todasAulas: any[] = [];
            mods.forEach((m: any) => {
                const a = ServicoArmazenamento.getByProperty('Aulas', 'ID_Modulo', m.ID_Modulo);
                // Garantir que não existam aulas duplicadas na listagem (devido a falhas passadas do mock)
                a.forEach((aulaItem: any) => {
                    if (!todasAulas.some(existente => existente.ID_Aula === aulaItem.ID_Aula)) {
                        todasAulas.push(aulaItem);
                    }
                });
            });
            setAulas(todasAulas);

            
            if (todasAulas.length > 0) {
                setAulaAtual(todasAulas[0]);
            }
        }
    }, [navigate, location.search]);

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
                            <div className="progress-bar bg-secondary" role="progressbar" style={{ width: `${progresso}%` }}></div>
                        </div>
                        {progresso === 100 && (
                            <Link to={`/certificado?curso=${curso?.ID_Curso}`} className="btn btn-sm btn-outline-warning ms-4">
                                <i className="bi bi-award-fill"></i> Emitir Certificado
                            </Link>
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
                            <h2 className="fw-bold mb-0 text-white">{aulaAtual ? aulaAtual.Titulo : 'Título da Aula'}</h2>
                            <button className="btn btn-outline-secondary" onClick={() => setProgresso(100)}>
                                <i className="bi bi-check-circle"></i> Marcar como Concluída
                            </button>
                        </div>
                        
                        <div className="card card-custom p-4 bg-transparent border-secondary border-opacity-25">
                            <h5 className="text-white mb-3">Sobre esta aula</h5>
                            <p className="text-muted">Descrição e materiais complementares simulados.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Grade Curricular */}
                <div style={{ width: '350px', flexShrink: 0, backgroundColor: 'var(--dark-card)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="p-4">
                    <h5 className="text-white fw-bold mb-4">Conteúdo do Curso</h5>
                    <div className="list-group">
                        {aulas.map((aula, idx) => (
                            <button 
                                key={aula.ID_Aula} 
                                className={`list-group-item list-group-item-action ${aulaAtual?.ID_Aula === aula.ID_Aula ? 'active' : 'bg-transparent text-white'}`}
                                onClick={() => setAulaAtual(aula)}
                                style={{ border: 'none', borderBottom: '1px solid var(--border-color)' }}
                            >
                                Aula {idx + 1}: {aula.Titulo}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
