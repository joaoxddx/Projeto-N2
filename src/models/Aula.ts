export class Aula {
    ID_Aula: number;
    ID_Modulo: number;
    Titulo: string;
    TipoConteudo: string;
    URL_Conteudo: string;
    DuracaoMinutos: number;
    Ordem: number;

    constructor(id: number, idModulo: number, titulo: string, tipoConteudo: string, urlConteudo: string, duracaoMinutos: number, ordem: number) {
        this.ID_Aula = id;
        this.ID_Modulo = idModulo;
        this.Titulo = titulo;
        this.TipoConteudo = tipoConteudo;
        this.URL_Conteudo = urlConteudo;
        this.DuracaoMinutos = duracaoMinutos;
        this.Ordem = ordem;
    }
}
