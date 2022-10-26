import { InternalError } from "@src/util/internal-error";
import * as HTTPUtil from "@src/util/request";
import { ResponsePluggyAuth } from "./pluggyAuth";
import { APIURLPLUGGY } from "@src/clients/pluggyAuth";
import { ResponsePluggyListConectorsData } from "./pluggyConnectors";

interface Category {
  id: string;
  description: string;
  parentId?: string;
  parentDescription?: string;
}

interface ResponseAPICategoryData
  extends Omit<ResponsePluggyListConectorsData, "results"> {
  results: Category[];
}

interface ResponseAPICategory extends Omit<ResponsePluggyAuth, "data"> {
  data: ResponseAPICategoryData;
  // aqui quando for comfigurar multiplas conta vão receber mais 1 tipo de data
}

export class PluggyCategory {
  constructor(protected request = new HTTPUtil.Request()) {}

  public async BuscaCategorias(APIKEY: string): Promise<Category[]> {
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
      const response: ResponseAPICategory = await this.request.get<any>(
        `${APIURLPLUGGY}categories`,
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
}
