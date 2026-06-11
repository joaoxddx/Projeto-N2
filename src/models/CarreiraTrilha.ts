export class CarreiraTrilha {
    ID_Carreira: number;
    ID_Trilha: number;
    Ordem: number;

    constructor(idCarreira: number, idTrilha: number, ordem: number) {
        this.ID_Carreira = idCarreira;
        this.ID_Trilha = idTrilha;
        this.Ordem = ordem;
    }
}
