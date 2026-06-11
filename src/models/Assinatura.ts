export class Assinatura {
    ID_Assinatura: number;
    ID_Usuario: number;
    ID_Plano: number;
    DataInicio: string;
    DataFim: string | null;

    constructor(id: number, idUsuario: number, idPlano: number, dataInicio?: string | null, dataFim: string | null = null) {
        this.ID_Assinatura = id;
        this.ID_Usuario = idUsuario;
        this.ID_Plano = idPlano;
        this.DataInicio = dataInicio || new Date().toISOString();
        this.DataFim = dataFim;
    }
}
