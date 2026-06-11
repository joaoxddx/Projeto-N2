export class Curso {
    ID_Curso: number;
    Titulo: string;
    Descricao: string;
    ID_Instrutor: number;
    ID_Categoria: number;
    Nivel: string;
    DataPublicacao: string;
    TotalAulas: number;
    TotalHoras: number;
    ImgUrl: string;

    constructor(id: number, titulo: string, descricao: string, idInstrutor: number, idCategoria: number, nivel: string, dataPublicacao?: string | null, totalAulas: number = 0, totalHoras: number = 0, imgUrl?: string | null) {
        this.ID_Curso = id;
        this.Titulo = titulo;
        this.Descricao = descricao;
        this.ID_Instrutor = idInstrutor;
        this.ID_Categoria = idCategoria;
        this.Nivel = nivel;
        this.DataPublicacao = dataPublicacao || new Date().toISOString();
        this.TotalAulas = totalAulas;
        this.TotalHoras = totalHoras;
        this.ImgUrl = imgUrl || 'https://via.placeholder.com/300x200?text=Curso'; 
    }
}
