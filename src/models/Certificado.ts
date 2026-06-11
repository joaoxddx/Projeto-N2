export class Certificado {
    ID_Certificado: number;
    ID_Usuario: number;
    ID_Curso: number;
    ID_Trilha: number;
    CodigoVerificacao: string;
    DataEmissao: string;

    constructor(id: number, idUsuario: number, idCurso: number, idTrilha: number, codigoVerificacao: string, dataEmissao?: string | null) {
        this.ID_Certificado = id;
        this.ID_Usuario = idUsuario;
        this.ID_Curso = idCurso;
        this.ID_Trilha = idTrilha;
        this.CodigoVerificacao = codigoVerificacao;
        this.DataEmissao = dataEmissao || new Date().toISOString();
    }
}
