export class TrilhaCurso {
    ID_Trilha: number;
    ID_Curso: number;
    Ordem: number;

    constructor(idTrilha: number, idCurso: number, ordem: number) {
        this.ID_Trilha = idTrilha;
        this.ID_Curso = idCurso;
        this.Ordem = ordem;
    }
}
