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
