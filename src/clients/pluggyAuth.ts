import { InternalError } from "@src/util/internal-error";
import * as HTTPUtil from "@src/util/request";

export const APIURLPLUGGY = "https://api.pluggy.ai/";
// armazenar de outro forma parece uma ideia melhor

interface DataApiKey {
  [key: string]: string;
}

export interface ResponsePluggyAuth {
  data: DataApiKey;
  status: number;
  // interface de resposta da pluggy
}

export class PluggyAuth {
  constructor(protected request = new HTTPUtil.Request()) {}

  public async buscaPluggyTokenAutenticado(): Promise<string> {
    const axiosConfig = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const info = {
      clientId: `${process.env.CLIENTID}`,
      clientSecret: `${process.env.CLIENTSECRET}`,
    };
    // essa é a estruta dos dados que passeremos para a pi
    // substitua os dados com os que constam no https://dashboard.pluggy.ai/applications
    try {
      const response: ResponsePluggyAuth = await this.request.post(
        "https://api.pluggy.ai/auth",
        // pegando o link da api global
        info,
        axiosConfig
      );
      return response.data.apiKey;
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
