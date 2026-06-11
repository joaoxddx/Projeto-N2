export class Carreira {
    ID_Carreira: number;
    Titulo: string;
    Descricao: string;

    constructor(id: number, titulo: string, descricao: string) {
        this.ID_Carreira = id;
        this.Titulo = titulo;
        this.Descricao = descricao;
    }
}
