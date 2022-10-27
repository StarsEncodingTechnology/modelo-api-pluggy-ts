import { PluggyItens } from "@src/clients/pluggyItens";
import { Item } from "@src/model/item";

export class ItensPluggyService {
  constructor(protected pluggyItens = new PluggyItens()) {}

  public async processoDeCriacaoItem(
    idUser: string,
    user: string,
    password: string,
    connectorId: number,
    apiKey: string
  ): Promise<Boolean> {
    try {
      const item = await this.pluggyItens.CriaConexaoPluggyBanco(
        apiKey,
        user,
        password,
        connectorId
      );
      // bate na rota da pluggy para criar o item
      // @TODO não está validando caso já exista esse banco
      await this.criaItemDB(idUser, item.itemId, item.nameBank);

      return true;
    } catch (e) {
      // essa estruta de erro não é das  melhores de se utilizar
      // a maneiras melhores criando uma class de internal erro e usando ela
      // para extender o erro local que aconteceu
      // com isso todos os erros do sistema vão parar no mesmo lugar e para o fim
      // de logar eles
      console.log(e);
      throw new Error("Erro na criação do item: " + e);
    }
  }

  private async criaItemDB(
    userIDMongoose: string,
    itemIdPluggy: string,
    nameBank: string
  ): Promise<void> {
    try {
      const item = new Item({
        user: userIDMongoose,
        itemId: itemIdPluggy,
        nameBank: nameBank,
      });
      await item.save();
    } catch (e) {
      throw new Error("Error salvar db" + e);
    }
  }
}
