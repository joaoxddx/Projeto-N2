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
