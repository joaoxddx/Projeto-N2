export class Trilha {
    ID_Trilha: number;
    Titulo: string;
    Descricao: string;
    ID_Categoria: number;

    constructor(id: number, titulo: string, descricao: string, idCategoria: number) {
        this.ID_Trilha = id;
        this.Titulo = titulo;
        this.Descricao = descricao;
        this.ID_Categoria = idCategoria;
    }
}
