export class Plano {
    ID_Plano: number;
    Nome: string;
    Descricao: string;
    Preco: number;
    DuracaoMeses: number;

    constructor(id: number, nome: string, descricao: string, preco: number, duracaoMeses: number) {
        this.ID_Plano = id;
        this.Nome = nome;
        this.Descricao = descricao;
        this.Preco = preco;
        this.DuracaoMeses = duracaoMeses;
    }
}
