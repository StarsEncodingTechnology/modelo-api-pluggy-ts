import { InternalError } from "@src/util/internal-error";
import * as HTTPUtil from "@src/util/request";
import { ResponsePluggyAuth } from "./pluggyAuth";
import { APIURLPLUGGY } from "@src/clients/pluggyAuth";
import { ResponsePluggyListConectorsData } from "./pluggyConnectors";

export interface BankData {
  transferNumber: string;
  closingBalance: string | null;
}

export interface DetalhesAccountBANK {
  id: string;
  type: string;
  subtype: string;
  name: string;
  balance: number;
  currencyCode: string;
  itemId: string;
  number: string;
  marketingName: string | null;
  taxNumber: string;
  owner: string;
  bankData: BankData | null;
  creditData: any;
}

export interface DataAccount
  extends Omit<ResponsePluggyListConectorsData, "results"> {
  results: DetalhesAccountBANK[];
}

interface ResponseAPIAccount extends Omit<ResponsePluggyAuth, "data"> {
  data: DataAccount;
  // aqui quando for comfigurar multiplas conta vão receber mais 1 tipo de data
}

export class PluggyAccount {
  constructor(protected request = new HTTPUtil.Request()) {}

  public async BuscaContasDoItem(
    APIKEY: string,
    itemId: string
  ): Promise<DetalhesAccountBANK> {
    const axiosConfig = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-KEY": APIKEY,
        // X-API-KEY é aonde deve ir sua APIKEY
        // que vc consegue na rota de Auth
      },
    };

    // isso pode variar de acordo com obanco utilizado
    // @TODO fazer a diversificação dos banco e cartão de credito

    try {
      const response: ResponseAPIAccount = await this.request.get<any>(
        `${APIURLPLUGGY}accounts?itemId=${itemId}`,
        axiosConfig
      );

      // @TODO é atualizar a rota para trazer outros tipos de contas
      // associadas ao item

      return response.data.results[0];
      // se atentar aqui pq está buscando somente os dados do Bancarios
      // da categoria BANK
      // IMPORTANTE caso queria expandir o sistema
    } catch (err) {
      if (err instanceof Error && HTTPUtil.Request.isRequestError(err)) {
        const error = HTTPUtil.Request.extractErrorData(err);
        throw new InternalError(
          `Error: ${JSON.stringify(error.data)} Code: ${error.status}`,
          error.status
        );
      }
      throw new InternalError(
        `Error Inesperado na comunicação com a Pluggy: ${
          (err as Error).message
        }`,
        500
      );
    }
  }
}
