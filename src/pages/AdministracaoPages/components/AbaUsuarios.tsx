import React, { useState, useEffect } from 'react';
import { ServicoArmazenamento } from '../../../services/ServicoArmazenamento';

export const AbaUsuarios = ({ admin }: { admin: any }) => {
    const [usuarios, setUsuarios] = useState<any[]>([]);

    useEffect(() => {
        loadDados();
    }, []);

    const loadDados = async () => {
        setUsuarios(await ServicoArmazenamento.getAll('Usuarios'));
    };

    const handleDeleteUsuario = async (id: number) => {
        if (id === admin.ID_Usuario) {
            alert('Você não pode excluir sua própria conta enquanto está logado.');
            return;
        }
        if (window.confirm('Deseja realmente excluir este usuário?')) {
            await ServicoArmazenamento.delete('Usuarios', 'ID_Usuario', id);
            await loadDados();
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Relatório de Usuários</h2>
            </div>
            <div className="card card-custom p-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-dark table-hover mb-0">
                        <thead><tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Role</th><th>Ações</th></tr></thead>
                        <tbody>
                            {usuarios.length === 0 && <tr><td colSpan={5} className="text-center">Nenhum usuário cadastrado.</td></tr>}
                            {usuarios.map((u, index) => (
                                <tr key={u.id || `${u.ID_Usuario}-${index}`}>
                                    <td>{u.ID_Usuario}</td>
                                    <td>{u.NomeCompleto}</td>
                                    <td>{u.Email}</td>
                                    <td>{u.Role}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUsuario(u.ID_Usuario)}><i className="bi bi-trash"></i> Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
