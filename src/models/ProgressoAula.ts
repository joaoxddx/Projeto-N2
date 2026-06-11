export class ProgressoAula {
    ID_Usuario: number;
    ID_Aula: number;
    DataConclusao: string;
    Status: string;

    constructor(idUsuario: number, idAula: number, dataConclusao: string, status: string) {
        this.ID_Usuario = idUsuario;
        this.ID_Aula = idAula;
        this.DataConclusao = dataConclusao;
        this.Status = status;
    }
}
