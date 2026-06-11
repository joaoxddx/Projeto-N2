import React, { useState, useEffect } from 'react';
import { ServicoArmazenamento } from '../../../services/ServicoArmazenamento';
import { Carreira, CarreiraTrilha } from '../../../models';
import { Modal } from '../../../components/Modal/Modal';

export const AbaCarreiras = () => {
    const [carreiras, setCarreiras] = useState<any[]>([]);
    const [trilhas, setTrilhas] = useState<any[]>([]);
    
    const [showCarreiraModal, setShowCarreiraModal] = useState(false);
    const [carreiraForm, setCarreiraForm] = useState({ ID_Carreira: 0 as number | string, Titulo: '', Descricao: '', trilhasSelecionadas: [] as number[] });

    useEffect(() => {
        loadDados();
    }, []);

    const loadDados = async () => {
        setCarreiras(await ServicoArmazenamento.getAll('Carreiras'));
        setTrilhas(await ServicoArmazenamento.getAll('Trilhas'));
    };

    const handleSaveCarreira = async (e: React.FormEvent) => {
        e.preventDefault();
        const novaCarreira = new Carreira(carreiraForm.ID_Carreira as any, carreiraForm.Titulo, carreiraForm.Descricao);
        
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
            await ServicoArmazenamento.insert('Carreiras_Trilhas', new CarreiraTrilha(targetCarreiraId as any, carreiraForm.trilhasSelecionadas[i] as any, i + 1));
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

    return (
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

            <Modal show={showCarreiraModal} onClose={() => setShowCarreiraModal(false)} title={carreiraForm.ID_Carreira && carreiraForm.ID_Carreira !== 0 && carreiraForm.ID_Carreira !== '0' ? 'Editar Carreira' : 'Cadastrar Nova Carreira'}>
                <form onSubmit={handleSaveCarreira}>
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
                                            const val = Number(e.target.value);
                                            if (checked) {
                                                setCarreiraForm({...carreiraForm, trilhasSelecionadas: [...carreiraForm.trilhasSelecionadas, val]});
                                            } else {
                                                setCarreiraForm({...carreiraForm, trilhasSelecionadas: carreiraForm.trilhasSelecionadas.filter(id => id !== val)});
                                            }
                                        }} id={`chk_trilha_${t.ID_Trilha}`} />
                                    <label className="form-check-label" htmlFor={`chk_trilha_${t.ID_Trilha}`}>
                                        {t.Titulo}
                                    </label>
                                </div>
                            ))}
                            {trilhas.length === 0 && <small className="text-muted">Nenhuma trilha cadastrada ainda.</small>}
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowCarreiraModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar Carreira</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
