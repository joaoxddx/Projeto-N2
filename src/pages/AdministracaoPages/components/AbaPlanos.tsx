import React, { useState, useEffect } from 'react';
import { ServicoArmazenamento } from '../../../services/ServicoArmazenamento';
import { Modal } from '../../../components/Modal/Modal';

export const AbaPlanos = () => {
    const [planos, setPlanos] = useState<any[]>([]);
    
    const [showPlanoModal, setShowPlanoModal] = useState(false);
    const [planoForm, setPlanoForm] = useState({ ID_Plano: 0 as number | string, Nome: '', Descricao: '', Preco: 0, DuracaoMeses: 1 });

    useEffect(() => {
        loadDados();
    }, []);

    const loadDados = async () => {
        setPlanos(await ServicoArmazenamento.getAll('Planos'));
    };

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

    return (
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
                            {planos.length === 0 && <tr><td colSpan={4} className="text-center">Nenhum plano cadastrado.</td></tr>}
                            {planos.map((p, index) => (
                                <tr key={p.id || `${p.ID_Plano}-${index}`}>
                                    <td>{p.ID_Plano}</td>
                                    <td>{p.Nome}</td>
                                    <td>R$ {Number(p.Preco).toFixed(2)}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-warning" onClick={() => openEditPlano(p)}><i className="bi bi-pencil"></i> Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showPlanoModal} onClose={() => setShowPlanoModal(false)} title={planoForm.ID_Plano && planoForm.ID_Plano !== 0 && planoForm.ID_Plano !== '0' ? 'Editar Plano' : 'Cadastrar Novo Plano'}>
                <form onSubmit={handleSavePlano}>
                    <div className="mb-3">
                        <label className="form-label">Nome do Plano</label>
                        <input type="text" className="form-control" value={planoForm.Nome} onChange={e => setPlanoForm({...planoForm, Nome: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Descrição</label>
                        <textarea className="form-control" value={planoForm.Descricao} onChange={e => setPlanoForm({...planoForm, Descricao: e.target.value})} required></textarea>
                    </div>
                    <div className="row">
                        <div className="col-6 mb-3">
                            <label className="form-label">Preço (R$)</label>
                            <input type="number" step="0.01" className="form-control" value={planoForm.Preco} onChange={e => setPlanoForm({...planoForm, Preco: Number(e.target.value)})} required />
                        </div>
                        <div className="col-6 mb-3">
                            <label className="form-label">Duração (Meses)</label>
                            <input type="number" className="form-control" value={planoForm.DuracaoMeses} onChange={e => setPlanoForm({...planoForm, DuracaoMeses: Number(e.target.value)})} required />
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowPlanoModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar Plano</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
