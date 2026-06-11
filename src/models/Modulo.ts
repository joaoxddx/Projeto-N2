export class Modulo {
    ID_Modulo: number;
    ID_Curso: number;
    Titulo: string;
    Ordem: number;

    constructor(id: number, idCurso: number, titulo: string, ordem: number) {
        this.ID_Modulo = id;
        this.ID_Curso = idCurso;
        this.Titulo = titulo;
        this.Ordem = ordem;
    }
}
