import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

import * as dataBase from "@src/database";
import { User } from "@src/model/user";
import { Transaction } from "@src/model/transaction";
import { Item } from "@src/model/item";

import { PluggyItens } from "@src/clients/pluggyItens";
import { ItensPluggyService } from "../pluggyItensService";
jest.mock("@src/clients/pluggyItens");

describe("Pluggy itens service", () => {
  //-------------------- configurações DB
  const defaultUser = {
    name: "Pedro Elias",
    email: "star@encodingstars.com",
    password: "Teste_pluggy_itens_service",
  };

  beforeAll(async () => {
    await dataBase.connect();
    // faz a conexão com o DB
  });

  let userId: string;
  beforeEach(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Item.deleteMany({});
    // delete todos os dados toda a vez q se inicia um novo teste;
    const user = await new User(defaultUser).save();
    userId = user.id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Item.deleteMany({});
    await dataBase.close();
  });
  //---------------------configurações JEST para não bater realmente na API nos teste
  const mockedPluggyItensClient = new PluggyItens() as jest.Mocked<PluggyItens>;

  it("deve retornar verdadeiro quando excecutado corretamente ", async () => {
    mockedPluggyItensClient.CriaConexaoPluggyBanco.mockResolvedValue({
      nameBank: "Pluggy Bank BR Business",
      itemId: "026498fc-877a-469f-9192-b71142eb728c",
      idBank: 8,
      status: "UPDATING",
      executionStatus: "CREATED",
      error: "",
      ultimaAtt: "2022-10-21T17:06:50.049Z",
    });

    const pluggyItemService = new ItensPluggyService(mockedPluggyItensClient);
    const response = await pluggyItemService.processoDeCriacaoItem(
      userId,
      "user-ok",
      "password-ok",
      8,
      "teste-api-key"
    );

    expect(response).toBe(true);
  });

  it("deve retornar um erro quando o Client retornar erro de falta de conexão", async () => {
    mockedPluggyItensClient.CriaConexaoPluggyBanco.mockRejectedValue(
      "Error Inesperado na comunicação com a Pluggy: Network error"
    );

    const pluggyItemService = new ItensPluggyService(mockedPluggyItensClient);
    await expect(
      pluggyItemService.processoDeCriacaoItem(
        userId,
        "user-ok",
        "password-ok",
        8,
        "teste-api-key"
      )
    ).rejects.toThrow(
      "Erro na criação do item: Error Inesperado na comunicação com a Pluggy: Network error"
    );
  });

  it("deve retornar um erro quando o apiToken é invalido", async () => {
    mockedPluggyItensClient.CriaConexaoPluggyBanco.mockRejectedValue(
      "Error Inesperado na comunicação com a Pluggy: Missing or invalid authorization token"
    );

    const pluggyItemService = new ItensPluggyService(mockedPluggyItensClient);

    await expect(
      pluggyItemService.processoDeCriacaoItem(
        userId,
        "user-ok",
        "password-ok",
        8,
        "teste-api-key"
      )
    ).rejects.toThrow(
      "Erro na criação do item: Error Inesperado na comunicação com a Pluggy: Missing or invalid authorization token"
    );
  });
});
