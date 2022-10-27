import { PluggyAuth } from "@src/clients/pluggyAuth";

export class AuthPluggyService {
  constructor(protected pluggyAuth = new PluggyAuth()) {}

  public async processoDeBuscaDeTokenPluggy(): Promise<string> {
    return await this.pluggyAuth.buscaPluggyTokenAutenticado();
  }

  // @TODO
  // extremamente necessario a inplementação do cache em uma segunda
  // rodada de desenvolvimento desse APP
  // fazendo essa class para caso queira implementar algo a mais

  // cache GALERA
}
