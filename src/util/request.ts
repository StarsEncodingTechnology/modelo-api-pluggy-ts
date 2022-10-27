import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { request } from "http";

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface RequestConfig extends AxiosRequestConfig {}
// extende e mascara o axiosRequestConfig
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Response<T = any> extends AxiosResponse<T> {}
// extende e marcara o axiosRespose<T>
// T sendo generico

// QUAL A NECESSIDADE DISSO
// isso é um jeito de modular o codigo, se vc desejar trocar o axios que é uma ferramenta de consumo de api
// por qualquer outra a seu desejo, é só trocar nesse arquivo
// sem nenhuma necessidade de alterar os /clients
//----------------------------------
// acima ---------------------------
//-----------acima------------------

export class Request {
  constructor(private request = axios) {}
  // sendo que esse obj é invocado
  // instancia o axios
  // mas poderia ser qualquer um

  public get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
    // essa função publica de nome Get
    // sendo ela generico
    // recebe url e config
    // e retornando o tipo promisse que deve conter a promessa de resposta de tipo generico
    return this.request.get<T, Response<T>>(url, config);
    // retorna chamando o get axios e esperando o retorno de um generico e de uma resposta que pode ser generica
    // passando o parametro url e config para a chamada
  }

  public post<T>(
    url: string,
    data: Object,
    config: RequestConfig = {}
  ): Promise<Response<T>> {
    //essa função é publica de nome Post
    // sendo q ela retornar generico
    // recebe a url da conexão
    // data são as informações dentro do {}
    // config são os headers são requisição

    return this.request.post<T, Response<T>>(url, data, config);
    // essa função chama a request.post e passa as informações
  }

  public patch<T>(
    url: string,
    data: Object,
    config: RequestConfig = {}
  ): Promise<Response<T>> {
    // essa public mascarar o axios.patch
    // ela retorna qualquer resposta possivel com generico
    return this.request.patch(url, data, config);
  }

  public static isRequestError(error: Error): boolean {
    // usado para validar se o erro veio de requisição
    return !!(
      // !! força o retorno boolean
      ((error as AxiosError).response && (error as AxiosError).response?.status)
      // error é atribuido a AxiosErros
      // pois o unico lugar aonde o axios é encontrato é nesse OBJ
    );
  }

  public static extractErrorData(
    // faz a estração do erro
    error: unknown
  ): Pick<AxiosResponse, "data" | "status"> {
    // pick é usado para (T, união de K)
    // aonde T é o AxiosResponse
    // o K é a união de 'data' e 'status'
    const axiosError = error as AxiosError;
    // aponta um tipo para error
    if (axiosError.response && axiosError.response.status) {
      // caso exista response e o status
      // é um erro de request
      return {
        // retorna os status dele
        data: axiosError.response.data,
        status: axiosError.response.status,
      };
    }
    // caso não
    // retorna um novo erro
    throw Error(`The error ${error} is not a Request Error`);
  }
}
