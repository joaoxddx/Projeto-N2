import React, { useState, useEffect } from 'react';
import { ServicoArmazenamento } from '../../../services/ServicoArmazenamento';
import { Trilha, TrilhaCurso } from '../../../models';
import { Modal } from '../../../components/Modal/Modal';

export const AbaTrilhas = () => {
    const [trilhas, setTrilhas] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [cursos, setCursos] = useState<any[]>([]);
    
    const [showTrilhaModal, setShowTrilhaModal] = useState(false);
    const [trilhaForm, setTrilhaForm] = useState({ ID_Trilha: 0 as number | string, Titulo: '', Descricao: '', ID_Categoria: 1, cursosSelecionados: [] as number[] });

    useEffect(() => {
        loadDados();
    }, []);

    const loadDados = async () => {
        setTrilhas(await ServicoArmazenamento.getAll('Trilhas'));
        setCategorias(await ServicoArmazenamento.getAll('Categorias'));
        setCursos(await ServicoArmazenamento.getAll('Cursos'));
    };

    const handleSaveTrilha = async (e: React.FormEvent) => {
        e.preventDefault();
        const catId = trilhaForm.ID_Categoria || (categorias.length > 0 ? categorias[0].ID_Categoria : 1);
        const novaTrilha = new Trilha(trilhaForm.ID_Trilha as any, trilhaForm.Titulo, trilhaForm.Descricao, catId);
        
        let targetTrilhaId = trilhaForm.ID_Trilha;
        if (trilhaForm.ID_Trilha && trilhaForm.ID_Trilha !== 0 && trilhaForm.ID_Trilha !== '0') {
            await ServicoArmazenamento.update('Trilhas', 'ID_Trilha', trilhaForm.ID_Trilha, novaTrilha);
            
            const antigos = await ServicoArmazenamento.getByProperty('Trilhas_Cursos', 'ID_Trilha', trilhaForm.ID_Trilha);
            for (const ant of antigos) {
                if(ant.id) await ServicoArmazenamento.delete('Trilhas_Cursos', 'id', ant.id);
            }
        } else {
            const savedTrilha = await ServicoArmazenamento.insert('Trilhas', novaTrilha);
            targetTrilhaId = savedTrilha.ID_Trilha || savedTrilha.id;
        }

        for (let i = 0; i < trilhaForm.cursosSelecionados.length; i++) {
            await ServicoArmazenamento.insert('Trilhas_Cursos', new TrilhaCurso(targetTrilhaId as any, trilhaForm.cursosSelecionados[i], i + 1));
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

    return (
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

            <Modal show={showTrilhaModal} onClose={() => setShowTrilhaModal(false)} title={trilhaForm.ID_Trilha && trilhaForm.ID_Trilha !== 0 && trilhaForm.ID_Trilha !== '0' ? 'Editar Trilha' : 'Cadastrar Nova Trilha'}>
                <form onSubmit={handleSaveTrilha}>
                    <div className="mb-3">
                        <label className="form-label">Título da Trilha</label>
                        <input type="text" className="form-control" value={trilhaForm.Titulo} onChange={e => setTrilhaForm({...trilhaForm, Titulo: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Descrição</label>
                        <textarea className="form-control" value={trilhaForm.Descricao} onChange={e => setTrilhaForm({...trilhaForm, Descricao: e.target.value})} required></textarea>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Categoria</label>
                        <select className="form-select" value={trilhaForm.ID_Categoria} onChange={e => setTrilhaForm({...trilhaForm, ID_Categoria: Number(e.target.value)})} required>
                            {categorias.map(cat => <option key={cat.ID_Categoria} value={cat.ID_Categoria}>{cat.Nome}</option>)}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Selecione os Cursos que compõem esta Trilha</label>
                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '5px' }}>
                            {cursos.map(c => (
                                <div className="form-check" key={c.ID_Curso}>
                                    <input className="form-check-input" type="checkbox" value={c.ID_Curso} 
                                        checked={trilhaForm.cursosSelecionados.includes(c.ID_Curso)}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            const val = Number(e.target.value);
                                            if (checked) {
                                                setTrilhaForm({...trilhaForm, cursosSelecionados: [...trilhaForm.cursosSelecionados, val]});
                                            } else {
                                                setTrilhaForm({...trilhaForm, cursosSelecionados: trilhaForm.cursosSelecionados.filter(id => id !== val)});
                                            }
                                        }} id={`chk_curso_${c.ID_Curso}`} />
                                    <label className="form-check-label" htmlFor={`chk_curso_${c.ID_Curso}`}>
                                        {c.Titulo}
                                    </label>
                                </div>
                            ))}
                            {cursos.length === 0 && <small className="text-muted">Nenhum curso cadastrado ainda.</small>}
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowTrilhaModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar Trilha</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
