import {
  DetalhesTransacoes,
  Pluggytransactions,
} from "@src/clients/pluggyTransactions";
import { Transaction, TypeTransaction } from "@src/model/transaction";

export class TransactionPluggy {
  constructor(protected pluggyTransaction = new Pluggytransactions()) {}

  public async buscaTransacoesDaConta(
    apiKey: string,
    accountId: string,
    itemIdMongoose: string
  ): Promise<Transaction[]> {
    try {
      const response = await this.pluggyTransaction.BuscaTransacoesDaConta(
        apiKey,
        accountId
      );

      const normalize = this.normalizaDadosParaBanco(response, itemIdMongoose);
      await this.atualizaDB(accountId, itemIdMongoose, normalize);
      return normalize;
    } catch (e) {
      if (!(e instanceof Error))
        throw new Error("Erro na busca da informação: " + e);

      throw new Error("Error generico: " + (e as Error).message);
    }
  }

  private normalizaDadosParaBanco(
    data: DetalhesTransacoes[],
    itemIdMongoose: string
  ): Transaction[] {
    return data.map((transaction) => ({
      itemIdMongoose: itemIdMongoose,
      accountId: transaction.accountId,
      transactionId: transaction.id,
      description: transaction.description,
      descriptionRaw: transaction.descriptionRaw
        ? transaction.descriptionRaw
        : "null",
      amount: transaction.amount,
      type: TypeTransaction.debit,
      // o TYPE a gente tem um enum pra ele lembra
      // caso acontece
      date: transaction.date,
      category: transaction.category,
      balance: transaction.balance,
      payerDoc: transaction.paymentData?.payer.documentNumber
        ? transaction.paymentData?.payer.documentNumber.value
        : "",
      receiverDoc: transaction.paymentData?.receiver.documentNumber
        ? transaction.paymentData?.receiver.documentNumber.value
        : "",
    }));
  }

  private async atualizaDB(
    accountId: string,
    itemIdMongoose: string,
    normalizeDados: Transaction[]
  ): Promise<void> {
    // @TODO
    // ISSO TEM Q ser refatorado
    // não é interesse fazer um requisição q pode trazer um número gigante
    const dadosNotasBanco: Transaction[] = await Transaction.find({
      accountId: accountId,
    });
    try {
      for (let prop in normalizeDados) {
        const element = normalizeDados[prop];
        const existe = dadosNotasBanco.find(
          (elementObject) =>
            elementObject.transactionId === element.transactionId
        );

        if (!existe)
          await new Transaction({
            ...element,
            ...{ itemIdMongoose: itemIdMongoose },
          }).save();
      }
    } catch (e) {
      // @TODO isso jamais pode acontecer
      // nenhuma captura de erro
      console.log({ e });
    }
  }
}
