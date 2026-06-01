import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ServicoArmazenamento } from '../../services/ServicoArmazenamento';
import { Usuario } from '../../models/Entidades';

export const LoginPages = () => {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginSenha, setLoginSenha] = useState('');
    const [regNome, setRegNome] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regSenha, setRegSenha] = useState('');
    const [regRole, setRegRole] = useState('student');
    const [activeTab, setActiveTab] = useState('login');
    const [alertMsg, setAlertMsg] = useState<{type: string, msg: string} | null>(null);

    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        ServicoArmazenamento.init();
        const users = ServicoArmazenamento.getAll('Usuarios');
        const user = users.find((u: any) => u.Email === loginEmail && u.SenhaHash === loginSenha);
        
        if (user) {
            localStorage.setItem('usuarioLogado', JSON.stringify(user));
            if (user.Role === 'admin') {
                navigate('/administracao');
            } else {
                navigate('/painel_aluno');
            }
        } else {
            setAlertMsg({ type: 'danger', msg: 'Email ou senha incorretos!' });
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        ServicoArmazenamento.init();
        const users = ServicoArmazenamento.getAll('Usuarios');
        
        if (users.some((u: any) => u.Email === regEmail)) {
            setAlertMsg({ type: 'danger', msg: 'Este email já está cadastrado.' });
            return;
        }

        const newUser = new Usuario(0, regNome, regEmail, regSenha, new Date().toISOString(), regRole);
        ServicoArmazenamento.insert('Usuarios', newUser);
        setAlertMsg({ type: 'success', msg: 'Cadastro realizado com sucesso! Faça o login.' });
        setActiveTab('login');
    };

    return (
        <div className="auth-container p-3" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--dark-bg) 0%, #1e1b4b 100%)' }}>
            <div className="auth-card d-flex flex-column flex-md-row" style={{ maxWidth: '900px', width: '100%', backgroundColor: 'var(--dark-card)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid var(--border-color)' }}>
                
                {/* Left Branding Side */}
                <div className="p-5 d-flex flex-column justify-content-center text-center bg-primary-custom text-white w-100" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                    
                    <h1 className="fw-bolder mb-3" style={{ fontSize: '3rem', letterSpacing: '-1px', position: 'relative', zIndex: 1 }}>FormaPro</h1>
                    <p className="lead position-relative z-1 mb-4">A excelência acadêmica e a inovação tecnológica no alcance das suas mãos.</p>
                    <Link to="/" className="btn btn-outline-light d-inline-block align-self-center position-relative z-1" style={{ borderRadius: '20px' }}>Voltar à Home</Link>
                </div>

                {/* Right Forms Side */}
                <div className="p-5 w-100" style={{ flex: 1 }}>
                    
                    {alertMsg && (
                        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show`} role="alert">
                            {alertMsg.msg}
                            <button type="button" className="btn-close" onClick={() => setAlertMsg(null)}></button>
                        </div>
                    )}

                    <ul className="nav nav-pills nav-justified mb-4" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className={`nav-link w-100 ${activeTab === 'login' ? 'active bg-primary-custom text-white' : 'text-muted'}`} onClick={() => setActiveTab('login')} type="button" style={{ borderRadius: '8px' }}>Entrar</button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className={`nav-link w-100 ${activeTab === 'register' ? 'active bg-primary-custom text-white' : 'text-muted'}`} onClick={() => setActiveTab('register')} type="button" style={{ borderRadius: '8px' }}>Cadastrar</button>
                        </li>
                    </ul>
                    
                    <div className="tab-content">
                        
                        {/* LOGIN FORM */}
                        {activeTab === 'login' && (
                            <div className="tab-pane fade show active">
                                <div className="text-center mb-4">
                                    <h3 className="fw-bold" style={{ color: 'var(--text-main)' }}>Bem-vindo(a) de volta!</h3>
                                    <p className="small" style={{ color: 'var(--text-muted)' }}>Acesse minicurso de demonstração padrão como `admin@formapro.com`(admin123) ou `aluno@formapro.com`(aluno123).</p>
                                </div>
                                <form onSubmit={handleLogin}>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Senha</label>
                                        <input type="password" className="form-control" value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 py-2">Acessar Plataforma</button>
                                </form>
                            </div>
                        )}

                        {/* REGISTER FORM */}
                        {activeTab === 'register' && (
                            <div className="tab-pane fade show active">
                                <div className="text-center mb-4">
                                    <h3 className="fw-bold" style={{ color: 'var(--text-main)' }}>Crie sua Conta</h3>
                                    <p className="small" style={{ color: 'var(--text-muted)' }}>Preencha os dados e escolha seu perfil</p>
                                </div>
                                <form onSubmit={handleRegister}>
                                    <div className="mb-3">
                                        <label className="form-label">Nome Completo</label>
                                        <input type="text" className="form-control" value={regNome} onChange={(e) => setRegNome(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Senha</label>
                                        <input type="password" className="form-control" value={regSenha} onChange={(e) => setRegSenha(e.target.value)} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Você é:</label>
                                        <select className="form-select" value={regRole} onChange={(e) => setRegRole(e.target.value)} required>
                                            <option value="student">Estudante (Fazer Cursos)</option>
                                            <option value="admin">Administrador (Gerir Plataforma)</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-secondary w-100 py-2">Realizar Cadastro</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
