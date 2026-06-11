import React, { useState, useEffect } from 'react';
import { ServicoArmazenamento } from '../../../services/ServicoArmazenamento';
import { Curso } from '../../../models';
import { Modal } from '../../../components/Modal/Modal';

export const AbaCursos = ({ admin }: { admin: any }) => {
    const [cursos, setCursos] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    
    const [showCursoModal, setShowCursoModal] = useState(false);
    const [showConteudoModal, setShowConteudoModal] = useState(false);

    const [cursoForm, setCursoForm] = useState({ ID_Curso: 0 as number | string, Titulo: '', Descricao: '', ID_Categoria: 1, Nivel: 'Iniciante', ImgUrl: '' });
    
    const [cursoSelecionado, setCursoSelecionado] = useState<any>(null);
    const [modulosCurso, setModulosCurso] = useState<any[]>([]);
    const [aulasCurso, setAulasCurso] = useState<any[]>([]);
    const [moduloForm, setModuloForm] = useState({ Titulo: '', Ordem: 1 });
    const [aulaForm, setAulaForm] = useState({ ID_Modulo: -1, Titulo: '', TipoConteudo: 'Video', DuracaoMinutos: 10, Ordem: 1 });
    const [filtroModuloId, setFiltroModuloId] = useState<string>('todos');

    useEffect(() => {
        loadDados();
    }, []);

    const loadDados = async () => {
        setCursos(await ServicoArmazenamento.getAll('Cursos'));
        setCategorias(await ServicoArmazenamento.getAll('Categorias'));
    };

    const handleSaveCurso = async (e: React.FormEvent) => {
        e.preventDefault();
        const catId = cursoForm.ID_Categoria || (categorias.length > 0 ? categorias[0].ID_Categoria : 1);
        const novoCurso = new Curso(cursoForm.ID_Curso as any, cursoForm.Titulo, cursoForm.Descricao, admin.ID_Usuario, catId, cursoForm.Nivel, null, 0, 0, cursoForm.ImgUrl);
        if (cursoForm.ID_Curso && cursoForm.ID_Curso !== 0 && cursoForm.ID_Curso !== '0') {
            await ServicoArmazenamento.update('Cursos', 'ID_Curso', cursoForm.ID_Curso, novoCurso);
        } else {
            await ServicoArmazenamento.insert('Cursos', novoCurso);
        }
        setShowCursoModal(false);
        await loadDados();
        setCursoForm({ ID_Curso: 0, Titulo: '', Descricao: '', ID_Categoria: 1, Nivel: 'Iniciante', ImgUrl: '' });
    };

    const openEditCurso = (c: any) => {
        setCursoForm({ ID_Curso: c.id || c.ID_Curso, Titulo: c.Titulo, Descricao: c.Descricao, ID_Categoria: c.ID_Categoria, Nivel: c.Nivel, ImgUrl: c.ImgUrl || '' });
        setShowCursoModal(true);
    };

    const handleDeleteCurso = async (id: number) => {
        if (window.confirm('Deseja excluir este curso?')) {
            await ServicoArmazenamento.delete('Cursos', 'ID_Curso', id);
            await loadDados();
        }
    };

    const openConteudoCurso = async (c: any) => {
        setCursoSelecionado(c);
        setFiltroModuloId('todos');
        await loadConteudoCurso(c.ID_Curso);
        setShowConteudoModal(true);
    };
    
    const loadConteudoCurso = async (idCurso: number) => {
        const mods = await ServicoArmazenamento.getByProperty('Modulos', 'ID_Curso', idCurso);
        mods.sort((a, b) => a.Ordem - b.Ordem);
        setModulosCurso(mods);
        setModuloForm(prev => ({ ...prev, Ordem: mods.length > 0 ? mods[mods.length - 1].Ordem + 1 : 1 }));
        
        const aulasTemp: any[] = [];
        for (const m of mods) {
            const aulasM = await ServicoArmazenamento.getByProperty('Aulas', 'ID_Modulo', m.ID_Modulo);
            aulasM.sort((a, b) => a.Ordem - b.Ordem);
            aulasTemp.push(...aulasM);
        }
        setAulasCurso(aulasTemp);
    };

    const handleAddModulo = async () => {
        if (!moduloForm.Titulo) return;
        await ServicoArmazenamento.insert('Modulos', { ID_Modulo: 0, ID_Curso: cursoSelecionado.ID_Curso, Titulo: moduloForm.Titulo, Ordem: moduloForm.Ordem });
        setModuloForm({ Titulo: '', Ordem: 1 });
        await loadConteudoCurso(cursoSelecionado.ID_Curso);
    };
    
    const handleAddAula = async () => {
        if (!aulaForm.Titulo || aulaForm.ID_Modulo === -1) return;
        await ServicoArmazenamento.insert('Aulas', { ID_Aula: 0, ID_Modulo: aulaForm.ID_Modulo, Titulo: aulaForm.Titulo, TipoConteudo: aulaForm.TipoConteudo, DuracaoMinutos: aulaForm.DuracaoMinutos, Ordem: aulaForm.Ordem });
        setAulaForm({ ID_Modulo: -1, Titulo: '', TipoConteudo: 'Video', DuracaoMinutos: 10, Ordem: 1 });
        await loadConteudoCurso(cursoSelecionado.ID_Curso);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Cursos Cadastrados</h2>
                <button className="btn btn-primary" onClick={() => { setCursoForm({ ID_Curso: 0, Titulo: '', Descricao: '', ID_Categoria: 1, Nivel: 'Iniciante', ImgUrl: '' }); setShowCursoModal(true); }}>+ Novo Curso</button>
            </div>
            <div className="card card-custom p-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead><tr><th>ID</th><th>Título</th><th>Nível</th><th>Ações</th></tr></thead>
                        <tbody>
                            {cursos.length === 0 && <tr><td colSpan={4} className="text-center">Nenhum curso cadastrado.</td></tr>}
                            {cursos.map((c, index) => (
                                <tr key={c.id || `${c.ID_Curso}-${index}`}>
                                    <td>{c.ID_Curso}</td>
                                    <td>{c.Titulo}</td>
                                    <td>{c.Nivel}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-info me-2" onClick={() => openConteudoCurso(c)}><i className="bi bi-list"></i> Conteúdo</button>
                                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => openEditCurso(c)}><i className="bi bi-pencil"></i> Editar</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCurso(c.ID_Curso)}><i className="bi bi-trash"></i> Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showCursoModal} onClose={() => setShowCursoModal(false)} title={cursoForm.ID_Curso && cursoForm.ID_Curso !== 0 && cursoForm.ID_Curso !== '0' ? 'Editar Curso' : 'Cadastrar Novo Curso'}>
                <form onSubmit={handleSaveCurso}>
                    <div className="mb-3">
                        <label className="form-label">Título do Curso</label>
                        <input type="text" className="form-control" value={cursoForm.Titulo} onChange={e => setCursoForm({...cursoForm, Titulo: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Descrição</label>
                        <textarea className="form-control" value={cursoForm.Descricao} onChange={e => setCursoForm({...cursoForm, Descricao: e.target.value})} required></textarea>
                    </div>
                    <div className="row">
                        <div className="col-6 mb-3">
                            <label className="form-label">Categoria</label>
                            <select className="form-select" value={cursoForm.ID_Categoria} onChange={e => setCursoForm({...cursoForm, ID_Categoria: Number(e.target.value)})} required>
                                {categorias.map(cat => <option key={cat.ID_Categoria} value={cat.ID_Categoria}>{cat.Nome}</option>)}
                            </select>
                        </div>
                        <div className="col-6 mb-3">
                            <label className="form-label">Nível</label>
                            <select className="form-select" value={cursoForm.Nivel} onChange={e => setCursoForm({...cursoForm, Nivel: e.target.value})} required>
                                <option value="Iniciante">Iniciante</option>
                                <option value="Intermediário">Intermediário</option>
                                <option value="Avançado">Avançado</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label">URL da Imagem</label>
                        <input type="url" className="form-control" value={cursoForm.ImgUrl} onChange={e => setCursoForm({...cursoForm, ImgUrl: e.target.value})} placeholder="https://" />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowCursoModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar Curso</button>
                    </div>
                </form>
            </Modal>

            <Modal show={showConteudoModal} onClose={() => setShowConteudoModal(false)} title={`Conteúdo: ${cursoSelecionado?.Titulo}`}>
                <div className="row">
                    <div className="col-md-6 border-end border-secondary">
                        <h5>Módulos</h5>
                        <div className="mb-3 d-flex align-items-end gap-2">
                            <div className="w-100">
                                <small className="text-muted">Título do Módulo</small>
                                <input type="text" className="form-control form-control-sm" placeholder="Título Módulo" value={moduloForm.Titulo} onChange={e => setModuloForm({...moduloForm, Titulo: e.target.value})} />
                            </div>
                            <div>
                                <small className="text-muted">Ordem</small>
                                <input type="number" className="form-control form-control-sm" placeholder="Ordem" style={{ width: '70px' }} value={moduloForm.Ordem} onChange={e => setModuloForm({...moduloForm, Ordem: Number(e.target.value)})} />
                            </div>
                            <button className="btn btn-sm btn-primary" onClick={handleAddModulo}>Adicionar</button>
                        </div>
                        <ul className="list-group list-group-flush mb-4">
                            {modulosCurso.map((m: any) => (
                                <li key={m.ID_Modulo} className="list-group-item bg-transparent text-white border-secondary">
                                    {m.Ordem} - {m.Titulo}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="col-md-6">
                        <h5>Aulas</h5>
                        <div className="mb-2">
                            <select className="form-select form-select-sm mb-2" value={aulaForm.ID_Modulo} onChange={e => setAulaForm({...aulaForm, ID_Modulo: Number(e.target.value)})}>
                                <option value={-1}>Selecione o Módulo</option>
                                {modulosCurso.map((m: any) => <option key={m.ID_Modulo} value={m.ID_Modulo}>{m.Titulo}</option>)}
                            </select>
                            <input type="text" className="form-control form-control-sm mb-2" placeholder="Título da Aula" value={aulaForm.Titulo} onChange={e => setAulaForm({...aulaForm, Titulo: e.target.value})} />
                            <div className="d-flex gap-2 mb-2">
                                <div className="w-50">
                                    <small className="text-muted">Duração (Min)</small>
                                    <input type="number" className="form-control form-control-sm" placeholder="Minutos" value={aulaForm.DuracaoMinutos} onChange={e => setAulaForm({...aulaForm, DuracaoMinutos: Number(e.target.value)})} title="Duração da aula em minutos" />
                                </div>
                                <div className="w-50">
                                    <small className="text-muted">Ordem na Lista</small>
                                    <input type="number" className="form-control form-control-sm" placeholder="Ordem" value={aulaForm.Ordem} onChange={e => setAulaForm({...aulaForm, Ordem: Number(e.target.value)})} title="Posição da aula no módulo" />
                                </div>
                            </div>
                            <button className="btn btn-sm btn-primary w-100" onClick={handleAddAula}>Adicionar Aula</button>
                        </div>
                        
                        <div className="d-flex align-items-center mb-2 mt-4 border-top border-secondary pt-3">
                            <small className="text-muted me-2" style={{ whiteSpace: 'nowrap' }}>Filtrar lista:</small>
                            <select className="form-select form-select-sm" value={filtroModuloId} onChange={e => setFiltroModuloId(e.target.value)}>
                                <option value="todos">Todos os Módulos</option>
                                {modulosCurso.map((m: any) => <option key={m.ID_Modulo} value={String(m.ID_Modulo)}>{m.Titulo}</option>)}
                            </select>
                        </div>
                        
                        <ul className="list-group list-group-flush" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {aulasCurso.filter(a => filtroModuloId === 'todos' || String(a.ID_Modulo) === filtroModuloId).map((a: any, index: number) => {
                                const mod = modulosCurso.find(m => String(m.ID_Modulo) === String(a.ID_Modulo));
                                return (
                                <li key={a.id || `${a.ID_Aula}-${index}`} className="list-group-item bg-transparent text-white border-secondary d-flex justify-content-between">
                                    <small>{a.Titulo} ({a.DuracaoMinutos}m)</small>
                                    <span className="badge bg-secondary">Módulo {mod ? mod.Ordem : '?'}</span>
                                </li>
                            )})}
                            {aulasCurso.filter(a => filtroModuloId === 'todos' || String(a.ID_Modulo) === filtroModuloId).length === 0 && (
                                <li className="list-group-item bg-transparent text-muted text-center border-secondary"><small>Nenhuma aula neste módulo.</small></li>
                            )}
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
