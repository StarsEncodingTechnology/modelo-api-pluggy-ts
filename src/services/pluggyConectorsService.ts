import {
  PluggyConectors,
  ResponsePluggyListConectorsData,
} from "@src/clients/pluggyConnectors";

export class ConnectorsPluggyService {
  // classe com somente 1
  // mas podendo ser acrescentado ou as outras rotas API

  constructor(protected pluggyConectors = new PluggyConectors()) {}

  public async processoDeBuscaDeBancos(
    apiKey: string,
    sandBox: Boolean = true
  ): Promise<ResponsePluggyListConectorsData> {
    return await this.pluggyConectors.buscaListaDeBancosDisponiveis(
      apiKey,
      sandBox
    );
  }

  // @TODO esse service pode ser incremento
}
