import { InternalError } from "@src/util/internal-error";
import * as HTTPUtil from "@src/util/request";
import { ResponsePluggyAuth } from "./pluggyAuth";
import { APIURLPLUGGY } from "@src/clients/pluggyAuth";
import { ResponsePluggyListConectorsData } from "./pluggyConnectors";

interface dadosDocumentos {
  type: string;
  value: string;
}

interface dadosParticipantes {
  name: string;
  branchNumber: string;
  accountNumber: string;
  routingNumber: string;
  documentNumber: dadosDocumentos;
}

interface paymentDetalhes {
  payer: dadosParticipantes;
  receiver: dadosParticipantes;
  reason: string;
  referenceNumber: string;
}

export interface DetalhesTransacoes {
  id: string;
  description: string;
  descriptionRaw: string;
  amount: number;
  balance: number;
  currencyCode: string;
  date: string;
  category: string;
  accountId: string;
  providerCode: string | null;
  status: string;
  paymentData: paymentDetalhes | null;
  type: string | null;
  creditCardMetadata: string | null;
  merchant: string | null;
}

export interface Datatransactions
  extends Omit<ResponsePluggyListConectorsData, "results"> {
  results: DetalhesTransacoes[];
}

interface ResponseAPItransactions extends Omit<ResponsePluggyAuth, "data"> {
  data: Datatransactions;
  // aqui quando for comfigurar multiplas conta vão receber mais 1 tipo de data
}

interface ResponseAPItransactionsUpdate
  extends Omit<ResponsePluggyAuth, "data"> {
  data: DetalhesTransacoes;
}
export class Pluggytransactions {
  constructor(protected request = new HTTPUtil.Request()) {}

  public async BuscaTransacoesDaConta(
    APIKEY: string,
    accountID: string
  ): Promise<DetalhesTransacoes[]> {
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
    // @TODO fazer a busca se houver mais 1 pagina de transaçãoes

    try {
      const response: ResponseAPItransactions = await this.request.get<any>(
        `${APIURLPLUGGY}transactions?accountId=${accountID}`,
        axiosConfig
      );

      return response.data.results;
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

  public async AtualizaTransacaoDaConta(
    APIKEY: string,
    transactionId: string,
    categoryId: string
  ): Promise<Boolean> {
    const axiosConfig = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-KEY": APIKEY,
        // X-API-KEY é aonde deve ir sua APIKEY
        // que vc consegue na rota de Auth
      },
    };

    const data = { categoryId: categoryId };

    try {
      const response: ResponseAPItransactionsUpdate =
        await this.request.patch<any>(
          `${APIURLPLUGGY}transactions/${transactionId}`,
          data,
          axiosConfig
        );

      return typeof response.data.id == "string" && response.data.id != null;
      // checa se retornou o id caso tenha retornado o update aconteceu;
      // @TODO pode acontecer de necessitarmos de uma validação mais poderosa aqui
    } catch (err) {
      console.log(err);
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
