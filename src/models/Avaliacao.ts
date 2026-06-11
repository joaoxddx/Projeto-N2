export class Avaliacao {
    ID_Avaliacao: number;
    ID_Usuario: number;
    ID_Curso: number;
    Nota: number;
    Comentario: string;
    DataAvaliacao: string;

    constructor(id: number, idUsuario: number, idCurso: number, nota: number, comentario: string, dataAvaliacao?: string | null) {
        this.ID_Avaliacao = id;
        this.ID_Usuario = idUsuario;
        this.ID_Curso = idCurso;
        this.Nota = nota;
        this.Comentario = comentario;
        this.DataAvaliacao = dataAvaliacao || new Date().toISOString();
    }
}
