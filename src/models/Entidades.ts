export class Usuario {
    ID_Usuario: number;
    NomeCompleto: string;
    Email: string;
    SenhaHash: string;
    DataCadastro: string;
    Role: string;

    constructor(id: number, nomeCompleto: string, email: string, senhaHash: string, dataCadastro?: string, role: string = 'student') {
        this.ID_Usuario = id;
        this.NomeCompleto = nomeCompleto;
        this.Email = email;
        this.SenhaHash = senhaHash;
        this.DataCadastro = dataCadastro || new Date().toISOString();
        this.Role = role; 
    }
}

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

export class Matricula {
    ID_Matricula: number;
    ID_Usuario: number;
    ID_Curso: number;
    DataMatricula: string;
    DataConclusao: string | null;

    constructor(id: number, idUsuario: number, idCurso: number, dataMatricula?: string | null, dataConclusao: string | null = null) {
        this.ID_Matricula = id;
        this.ID_Usuario = idUsuario;
        this.ID_Curso = idCurso;
        this.DataMatricula = dataMatricula || new Date().toISOString();
        this.DataConclusao = dataConclusao;
    }
}

export class ProgressoAula {
    ID_Usuario: number;
    ID_Aula: number;
    DataConclusao: string;
    Status: string;

    constructor(idUsuario: number, idAula: number, dataConclusao: string, status: string) {
        this.ID_Usuario = idUsuario;
        this.ID_Aula = idAula;
        this.DataConclusao = dataConclusao;
        this.Status = status;
    }
}

export class Avaliacao {
    ID_Avaliacao: number;
    ID_Usuario: number;
    ID_Curso: number;
    Nota: number;
    Comentario: string;
    DataAvaliacao: string;

    constructor(id: number, idUsuario: number, idCurso: number, nota: number, comentario: string, dataAvaliacao?: string | null) {
        this.ID_Avaliacao = id;
        this.ID_Usuario = idUsuario;
        this.ID_Curso = idCurso;
        this.Nota = nota;
        this.Comentario = comentario;
        this.DataAvaliacao = dataAvaliacao || new Date().toISOString();
    }
}

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

export class Certificado {
    ID_Certificado: number;
    ID_Usuario: number;
    ID_Curso: number;
    ID_Trilha: number;
    CodigoVerificacao: string;
    DataEmissao: string;

    constructor(id: number, idUsuario: number, idCurso: number, idTrilha: number, codigoVerificacao: string, dataEmissao?: string | null) {
        this.ID_Certificado = id;
        this.ID_Usuario = idUsuario;
        this.ID_Curso = idCurso;
        this.ID_Trilha = idTrilha;
        this.CodigoVerificacao = codigoVerificacao;
        this.DataEmissao = dataEmissao || new Date().toISOString();
    }
}

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

export class Pagamento {
    ID_Pagamento: number;
    ID_Assinatura: number;
    ValorPago: number;
    DataPagamento: string;
    MetodoPagamento: string;
    Id_Transacao_Gateway: string;

    constructor(id: number, idAssinatura: number, valorPago: number, dataPagamento: string | null, metodoPagamento: string, idTransacaoGateway: string) {
        this.ID_Pagamento = id;
        this.ID_Assinatura = idAssinatura;
        this.ValorPago = valorPago;
        this.DataPagamento = dataPagamento || new Date().toISOString();
        this.MetodoPagamento = metodoPagamento;
        this.Id_Transacao_Gateway = idTransacaoGateway;
    }
}

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
