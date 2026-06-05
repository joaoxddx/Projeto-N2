import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ServicoArmazenamento } from '../../services/ServicoArmazenamento';

export const CertificadoPages = () => {
    const location = useLocation();
    const [certificado, setCertificado] = useState<any>(null);
    const [usuario, setUsuario] = useState<any>(null);
    const [curso, setCurso] = useState<any>(null);

    useEffect(() => {
        const fetchCertificado = async () => {
            const params = new URLSearchParams(location.search);
            let certId = params.get('id');

            // Se veio de sala de aula e quer emitir, a gente gera um mock
            if (!certId && params.get('curso')) {
                const userJson = localStorage.getItem('usuarioLogado');
                if (userJson) {
                    const u = JSON.parse(userJson);
                    const novoCert = {
                        ID_Certificado: 0,
                        ID_Usuario: u.ID_Usuario,
                        ID_Curso: parseInt(params.get('curso')!),
                        CodigoVerificacao: 'CERT-' + Math.random().toString(36).substring(7).toUpperCase(),
                        DataEmissao: new Date().toISOString()
                    };
                    const savedCert = await ServicoArmazenamento.insert('Certificados', novoCert);
                    certId = savedCert.ID_Certificado.toString();
                }
            }

            if (certId) {
                const cert = await ServicoArmazenamento.getById('Certificados', 'ID_Certificado', parseInt(certId));
                if (cert) {
                    setCertificado(cert);
                    setUsuario(await ServicoArmazenamento.getById('Usuarios', 'ID_Usuario', cert.ID_Usuario));
                    setCurso(await ServicoArmazenamento.getById('Cursos', 'ID_Curso', cert.ID_Curso));
                }
            }
        };
        fetchCertificado();
    }, [location]);

    if (!certificado || !usuario || !curso) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
                <div className="text-center">
                    <h2 className="text-danger">Certificado Não Encontrado</h2>
                    <p className="text-muted">Verifique se o link está correto.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
            <button className="btn btn-primary" onClick={() => window.print()} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>Imprimir PDF</button>

            <div style={{ width: '1000px', height: '700px', background: 'white', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px', textAlign: 'center', color: '#333' }}>
                <div style={{ width: '100%', height: '100%', border: '15px solid #4F46E5', padding: '40px', position: 'relative', background: '#fff' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '5rem', color: '#4F46E5', marginTop: '50px', marginBottom: '20px', fontWeight: 700 }}>Certificado</div>
                    <div style={{ fontSize: '1.5rem', color: '#666', marginBottom: '50px', textTransform: 'uppercase', letterSpacing: '2px' }}>de Conclusão</div>
                    
                    <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '20px' }}>Isto certifica formalmente que</p>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', color: '#111827', borderBottom: '2px solid #ccc', display: 'inline-block', paddingBottom: '10px', marginBottom: '30px', width: '80%' }}>
                        {usuario.NomeCompleto}
                    </div>
                    
                    <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: 1.8, padding: '0 50px', marginBottom: '50px' }}>
                        Completou com êxito todas as exigências curriculares, avaliações e a carga horária de <span style={{ fontWeight: 600 }}>{curso.TotalHoras || 0}</span> horas do curso<br />
                        <strong style={{ fontSize: '1.5rem', color: '#111827', display: 'block', marginTop: '15px' }}>{curso.Titulo}</strong>
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: '60px' }}>
                        <div>
                            <div style={{ borderTop: '1px solid #666', paddingTop: '10px', width: '250px', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>Data de Emissão</div>
                            <div style={{ marginTop: '5px' }}>{new Date(certificado.DataEmissao).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div style={{ borderTop: '1px solid #666', paddingTop: '10px', width: '250px', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>Instrutor / Diretor</div>
                            <div style={{ marginTop: '5px' }}>Plataforma FormaPro</div>
                        </div>
                    </div>

                    <div style={{ width: '120px', height: '120px', background: '#4F46E5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', position: 'absolute', bottom: '60px', right: '80px', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)' }}>
                        <div style={{ border: '2px dashed rgba(255,255,255,0.7)', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
                            Oficial<br/>FormaPro
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#999' }}>
                        Código de Validação: {certificado.CodigoVerificacao}
                    </div>
                </div>
            </div>
        </div>
    );
};
