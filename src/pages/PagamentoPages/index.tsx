import { useState, useEffect } from 'react';
import { Nav } from '../../components/Nav';
import { Footer } from '../../components/Footer';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ServicoArmazenamento } from '../../services/ServicoArmazenamento';
import { Assinatura, Pagamento } from '../../models/Entidades';

export const PagamentoPages = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [plano, setPlano] = useState<any>(null);
    const [metodo, setMetodo] = useState('cartao');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const planoId = queryParams.get('plano');
        
        if (planoId) {
            ServicoArmazenamento.getById('Planos', 'ID_Plano', planoId).then(p => {
                setPlano(p);
            });
        }
    }, [location]);

    const handlePagamento = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const userJson = localStorage.getItem('usuarioLogado');
        if (!userJson) {
            alert('Você precisa estar logado para assinar!');
            navigate('/login');
            return;
        }
        
        setLoading(true);
        const user = JSON.parse(userJson);

        // Simulando delay de gateway de pagamento
        setTimeout(async () => {
            // Criar Assinatura
            const novaAssinatura = new Assinatura(0, user.ID_Usuario, plano.ID_Plano);
            const assinSalva = await ServicoArmazenamento.insert('Assinaturas', novaAssinatura);

            // Criar Pagamento
            const novoPagamento = new Pagamento(0, assinSalva.ID_Assinatura, plano.Preco, null, metodo, 'TRANS_' + Math.floor(Math.random() * 1000000));
            await ServicoArmazenamento.insert('Pagamentos', novoPagamento);

            setLoading(false);
            navigate('/painel_aluno');
        }, 1500);
    };

    if (!plano) {
        return (
            <>
                <Nav />
                <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
                    <h2 className="mb-4">Plano não encontrado ou inválido.</h2>
                    <Link to="/#planos" className="btn btn-primary">Voltar aos Planos</Link>
                </div>
                <Footer />
            </>
        )
    }

    return (
        <div style={{ backgroundColor: 'var(--dark-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Nav />
            <div className="container py-5 flex-grow-1">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card card-custom p-4 shadow-lg border-0">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold" style={{ color: 'var(--text-main)' }}>Checkout de Pagamento</h2>
                                <p className="text-muted">Finalize sua assinatura de forma segura.</p>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-5">
                                    <div className="p-4 rounded-3 h-100" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', border: '1px solid var(--primary-color)' }}>
                                        <h5 className="fw-bold text-primary-custom mb-3">Resumo do Pedido</h5>
                                        <h4 className="fw-bolder" style={{ color: 'var(--text-main)' }}>{plano.Nome}</h4>
                                        <p className="text-muted small mb-4">{plano.Descricao}</p>
                                        
                                        <hr className="border-secondary opacity-25" />
                                        
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="text-muted">Total a pagar:</span>
                                            <h3 className="fw-bold text-success mb-0">R$ {plano.Preco.toFixed(2)}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <form onSubmit={handlePagamento}>
                                        <h5 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>Dados de Pagamento</h5>
                                        
                                        <div className="mb-4">
                                            <label className="form-label text-muted">Método de Pagamento</label>
                                            <select className="form-select" value={metodo} onChange={(e) => setMetodo(e.target.value)} required>
                                                <option value="cartao">Cartão de Crédito</option>
                                                <option value="pix">PIX</option>
                                                <option value="boleto">Boleto Bancário</option>
                                            </select>
                                        </div>

                                        {metodo === 'cartao' && (
                                            <>
                                                <div className="mb-3">
                                                    <input type="text" className="form-control" placeholder="Nome impresso no cartão" required />
                                                </div>
                                                <div className="mb-3">
                                                    <input type="text" className="form-control" placeholder="Número do cartão" maxLength={19} required />
                                                </div>
                                                <div className="row">
                                                    <div className="col-6 mb-3">
                                                        <input type="text" className="form-control" placeholder="Validade (MM/AA)" maxLength={5} required />
                                                    </div>
                                                    <div className="col-6 mb-3">
                                                        <input type="text" className="form-control" placeholder="CVC" maxLength={4} required />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {metodo === 'pix' && (
                                            <div className="alert alert-info py-2 small">
                                                O QR Code será gerado após clicar em confirmar.
                                            </div>
                                        )}

                                        <button type="submit" className="btn btn-primary w-100 py-3 mt-3 fw-bold" disabled={loading}>
                                            {loading ? 'Processando...' : `Confirmar Pagamento de R$ ${plano.Preco.toFixed(2)}`}
                                        </button>
                                        <div className="text-center mt-3">
                                            <small className="text-muted"><i className="bi bi-shield-lock"></i> Pagamento Simulado e Seguro</small>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};
