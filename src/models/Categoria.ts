export class Categoria {
    ID_Categoria: number;
    Nome: string;
    Descricao: string;

    constructor(id: number, nome: string, descricao: string) {
        this.ID_Categoria = id;
        this.Nome = nome;
        this.Descricao = descricao;
    }
}
