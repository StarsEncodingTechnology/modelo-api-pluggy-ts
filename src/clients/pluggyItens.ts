import { InternalError } from "@src/util/internal-error";
import * as HTTPUtil from "@src/util/request";
import { ResponsePluggyAuth } from "./pluggyAuth";
import { APIURLPLUGGY } from "@src/clients/pluggyAuth";

interface Connector {
  [key: string]: any
}

export interface ResponsePluggyItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  executionStatus: string;
  lastUpdatedAt: string | null;
  webhookUrl: string | null;
  error: string | null;
  clientUserId: string | null;
  statusDetail: string | null;
  parameter: string | null;
  connector: Connector;
}

interface ResponseAPIItens extends Omit<ResponsePluggyAuth, "data"> {
  data: ResponsePluggyItem;
}

export interface DadosNormalizadosItem {
  nameBank: string;
  itemId: string;
  idBank: Number;
  status: string;
  executionStatus: string;
  error: string | null;
  ultimaAtt: string;
}

export class PluggyItens {
  constructor(protected request = new HTTPUtil.Request()) {}

  public async CriaConexaoPluggyBanco(
    APIKEY: string,
    user: string,
    password: string,
    connectorId: number
  ): Promise<DadosNormalizadosItem> {
    const axiosConfig = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-KEY": APIKEY,
        // X-API-KEY é aonde deve ir sua APIKEY
        // que vc consegue na rota de Auth
      },
    };

    const data = {
      connectorId: connectorId,
      parameters: {
        user: user,
        password: password,
      },
    };

    // isso pode variar de acordo com obanco utilizado
    // @TODO fazer a diversificação dos bancos

    try {
      const response: ResponseAPIItens = await this.request.post<any>(
        `${APIURLPLUGGY}items`,
        data,
        axiosConfig
      );

      return this.normalizaDadosItem(response.data, connectorId);
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

  private normalizaDadosItem(
    dados: ResponsePluggyItem,
    idBank: number
  ): DadosNormalizadosItem {
    return {
      nameBank: dados.connector.name,
      itemId: dados.id,
      idBank: idBank,
      status: dados.status,
      executionStatus: dados.executionStatus,
      error: dados.error ? dados.error : "",
      ultimaAtt: dados.updatedAt,
    };
  }
}
