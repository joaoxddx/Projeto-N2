export class Matricula {
    ID_Matricula: number;
    ID_Usuario: number;
    ID_Curso: number;
    DataMatricula: string;
    DataConclusao: string | null;

    constructor(id: number, idUsuario: number, idCurso: number, dataMatricula?: string | null, dataConclusao: string | null = null) {
        this.ID_Matricula = id;
        this.ID_Usuario = idUsuario;
        this.ID_Curso = idCurso;
        this.DataMatricula = dataMatricula || new Date().toISOString();
        this.DataConclusao = dataConclusao;
    }
}
