import {
  DetalhesAccountBANK,
  PluggyAccount,
} from "@src/clients/pluggyAccounts";
import { Item } from "@src/model/item";

export interface AccountPluggyInterface extends DetalhesAccountBANK {}

export class AccountPluggy {
  constructor(protected pluggyAccount = new PluggyAccount()) {}

  public async processoDeBuscaDeContas(
    // isso está adaptado somente para o evento
    // não vai funcionar em PRD
    // pois está configurado para somente 1 tipo de conta
    // precisa de adaptações para suporte outros tipos

    apiKey: string,
    itemId: string,
    idMongoose: string
  ): Promise<AccountPluggyInterface> {
    // @TODO o service está configurado para o tipo de connector 8
    // isso resulta no mesmo retorno
    const response: AccountPluggyInterface =
      await this.pluggyAccount.BuscaContasDoItem(apiKey, itemId);

    await this.adicionaIdBanco(response, idMongoose);
    // @TODO fazer cache desses dados

    return response;
  }

  private async adicionaIdBanco(
    dadosBanco: AccountPluggyInterface,
    idMongoose: string
  ): Promise<Item> {
    let mudanca = {};

    // no dia do amanhã quando começar a receber mais de 1 conta
    // aqui é necessario colocar um loop para passar por todos
    switch (dadosBanco.type) {
      case "BANK":
        mudanca = { bankAccountId: dadosBanco.id };
        break;
    }

    const item = await Item.findByIdAndUpdate({ _id: idMongoose }, mudanca);

    if (item) return item;

    throw new Error("Error: item não encontrado");
  }
}
