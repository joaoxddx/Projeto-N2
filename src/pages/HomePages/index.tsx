import { useState, useEffect } from 'react';
import { Nav } from '../../components/Nav';
import { Footer } from '../../components/Footer';
import { ServicoArmazenamento } from '../../services/ServicoArmazenamento';
import { Link } from 'react-router-dom';

export const HomePages = () => {
    const [cursos, setCursos] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [planos, setPlanos] = useState<any[]>([]);
    const [avaliacoes, setAvaliacoes] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const cursosData = await ServicoArmazenamento.getAll('Cursos');
            setCursos(cursosData);
            
            const categoriasData = await ServicoArmazenamento.getAll('Categorias');
            setCategorias(categoriasData);
            
            const planosData = await ServicoArmazenamento.getAll('Planos');
            setPlanos(planosData);
            
            const avs = await ServicoArmazenamento.getAll('Avaliacoes');
            const avsFull = await Promise.all(avs.map(async (av: any) => {
                const user = await ServicoArmazenamento.getById('Usuarios', 'ID_Usuario', av.ID_Usuario);
                const course = await ServicoArmazenamento.getById('Cursos', 'ID_Curso', av.ID_Curso);
                return {
                    ...av,
                    NomeAluno: user ? user.NomeCompleto : 'Aluno Anônimo',
                    NomeCurso: course ? course.Titulo : 'Curso'
                };
            }));
            setAvaliacoes(avsFull);
        };
        fetchData();
    }, []);

    const getCategoriaNome = (id: number) => {
        const cat = categorias.find(c => c.ID_Categoria === id);
        return cat ? cat.Nome : 'Geral';
    };

    return (
        <>
            <Nav />
            {/* Hero Section */}
            <section className="hero-section text-center">
                <div className="hero-bg-gradient"></div>
                <div className="container position-relative z-1">
                    <h1 className="display-4 fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Desenvolva Habilidades Para o Futuro</h1>
                    <p className="lead mb-5 mx-auto" style={{ maxWidth: '600px', color: 'var(--text-muted)' }}>
                        Cursos de alta qualidade de Programação e Design ministrados por especialistas da indústria. Aprenda, pratique e conquiste seus objetivos.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <a href="#cursos" className="btn btn-primary btn-lg">Explorar Cursos</a>
                        <Link to="/login" className="btn btn-secondary btn-lg">Assine Já</Link>
                    </div>
                </div>
            </section>

            {/* Cursos Destaque */}
            <section id="cursos" className="py-5" style={{ backgroundColor: 'var(--input-bg)' }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold" style={{ color: 'var(--text-main)' }}>Nossos Cursos</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Explore opções em alta demanda e comece sua jornada.</p>
                    </div>
                    <div className="row g-4">
                        {cursos.length === 0 ? (
                            <p className="text-center text-muted">Ainda não há cursos disponíveis.</p>
                        ) : (
                            cursos.slice(0, 3).map(curso => (
                                <div className="col-md-4" key={curso.ID_Curso}>
                                    <div className="card card-custom h-100">
                                        <img src={curso.ImgUrl} className="card-img-top" alt={curso.Titulo} style={{ height: '200px', objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} />
                                        <div className="card-body">
                                            <span className="badge bg-primary-custom mb-2 me-1">{getCategoriaNome(curso.ID_Categoria)}</span>
                                            <span className="badge bg-secondary mb-2">{curso.Nivel}</span>
                                            <h5 className="card-title">{curso.Titulo}</h5>
                                            <p className="card-text small">{curso.Descricao.substring(0, 80)}...</p>
                                        </div>
                                        <div className="card-footer bg-transparent border-0 pb-3">
                                            <Link to="/login" className="btn btn-outline-primary w-100">Acessar Curso</Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Comentários dos Alunos (Avaliações) */}
            <section id="avaliacoes" className="py-5" style={{ backgroundColor: 'var(--dark-bg)' }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold" style={{ color: 'var(--text-main)' }}>O Que Nossos Alunos Dizem</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Feedback real de quem já transformou sua carreira com a FormaPro.</p>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {avaliacoes.length === 0 ? (
                            <p className="text-center text-muted">Ainda não há avaliações.</p>
                        ) : (
                            avaliacoes.map(av => (
                                <div className="col-md-6 col-lg-4" key={av.ID_Avaliacao}>
                                    <div className="card card-custom h-100 p-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                                                {av.NomeAluno.charAt(0)}
                                            </div>
                                            <div className="ms-3">
                                                <h6 className="mb-0 fw-bold">{av.NomeAluno}</h6>
                                                <small className="text-muted">{av.NomeCurso}</small>
                                            </div>
                                        </div>
                                        <div className="mb-2 text-warning">
                                            {/* Renderizar estrelas basedas na nota */}
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i}>{i < av.Nota ? '★' : '☆'}</span>
                                            ))}
                                        </div>
                                        <p className="fst-italic mb-0" style={{ color: 'var(--text-muted)' }}>"{av.Comentario}"</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Planos de Assinatura */}
            <section id="planos" className="py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold" style={{ color: 'var(--text-main)' }}>Escolha Seu Plano</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Acesso ilimitado ou sob medida para suas necessidades.</p>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {planos.map(plano => (
                            <div className="col-md-4" key={plano.ID_Plano}>
                                <div className="card card-custom h-100 text-center p-4">
                                    <h4 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>{plano.Nome}</h4>
                                    <h2 className="display-5 fw-bolder text-primary-custom mb-3">R$ {plano.Preco.toFixed(2)}<span className="fs-6" style={{ color: 'var(--text-muted)' }}>/{plano.DuracaoMeses == 1 ? 'mês' : plano.DuracaoMeses + ' meses'}</span></h2>
                                    <p className="mb-4" style={{ color: 'var(--text-muted)' }}>{plano.Descricao}</p>
                                    <Link to={`/pagamento?plano=${plano.ID_Plano}`} className="btn btn-primary btn-lg w-100 mt-auto">Selecionar Plano</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <Footer />
        </>
    );
};
