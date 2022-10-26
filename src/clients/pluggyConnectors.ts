import { InternalError } from "@src/util/internal-error";
import * as HTTPUtil from "@src/util/request";
import { ResponsePluggyAuth } from "./pluggyAuth";
import { APIURLPLUGGY } from "@src/clients/pluggyAuth";

interface DataApiKey {
  [key: string]: string;
}

export interface ResponsePluggyListConectorsData {
  total: number;
  totalPages: number;
  page: number;
  results: DataApiKey[];
  // interface de resposta da pluggy
}

interface ResponseAPIList extends Omit<ResponsePluggyAuth, "data"> {
  data: ResponsePluggyListConectorsData;
}

export class PluggyConectors {
  constructor(protected request = new HTTPUtil.Request()) {}

  public async buscaListaDeBancosDisponiveis(
    APIKEY: string,
    sandbox: Boolean = true
  ): Promise<ResponsePluggyListConectorsData> {
    const axiosConfig = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-KEY": APIKEY,
        // X-API-KEY é aonde deve ir sua APIKEY
        // que vc consegue na rota de Auth
      },
    };

    try {
      const response: ResponseAPIList = await this.request.get<any>(
        `${APIURLPLUGGY}connectors?sandbox=${sandbox.toString()}`,
        axiosConfig
      );

      return response.data;
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
