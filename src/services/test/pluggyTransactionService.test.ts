import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

import * as dataBase from "@src/database";
import { User } from "@src/model/user";
import { Transaction } from "@src/model/transaction";
import { Item } from "@src/model/item";
import AuthService from "../authService";
import {
  DetalhesTransacoes,
  Pluggytransactions,
} from "@src/clients/pluggyTransactions";

jest.mock("@src/clients/pluggyTransactions");

import { TransactionPluggy } from "@src/services/pluggyTransactionService";

import dadosCorretosRetornoListPluggyTransactions from "@test/fixtures/transactions/retornoCorretoPluggyTransactions.json";
import dadosCorretosRetornoServicePluggyTransactions from "@test/fixtures/transactions/retornoServiceTrasactions.json";

describe("Pluggy transaction Service", () => {
  //---------------variaveis e Banco de dados
  const defaultUser = {
    name: "Pedro Elias",
    email: "star@encodingstars.com",
    password: "Teste_pluggy_itens_service",
  };

  let info = {
    itemId: "",
    accountId: "8b5c48af-4063-4728-a1e0-8e08d2afdee6",
  };

  beforeAll(async () => {
    await dataBase.connect();
  });

  let token: string;
  beforeEach(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Item.deleteMany({});

    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());
    const item = await new Item({
      _id: "63583cbd8fcd271d479788ca",
      user: user._id,
      itemId: "87404422-f6fe-40f0-8a99-0e142712389a",
      nameBank: "Pluggy Bank BR Business",
    }).save();

    info.itemId = item.id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Item.deleteMany({});
    await dataBase.close();
  });

  //---------------mocked do consumo da api da pluggy
  const mockedPluggyTransactionsClients =
    new Pluggytransactions() as jest.Mocked<Pluggytransactions>;

  it("deve retornar os dados corretos", async () => {
    mockedPluggyTransactionsClients.BuscaTransacoesDaConta.mockResolvedValue(
      dadosCorretosRetornoListPluggyTransactions as DetalhesTransacoes[]
    );

    const transactionPluggy = new TransactionPluggy(
      mockedPluggyTransactionsClients
    );

    const response = await transactionPluggy.buscaTransacoesDaConta(
      "API-KEY",
      info.accountId,
      info.itemId
    );

    // console.log(response)

    expect(response).toEqual(dadosCorretosRetornoServicePluggyTransactions);
  });

  it("deve retonar um erro de networking", async () => {
    mockedPluggyTransactionsClients.BuscaTransacoesDaConta.mockRejectedValue(
      "Error Inesperado na comunicação com a Pluggy: Network error"
    );

    const transactionPluggy = new TransactionPluggy(
      mockedPluggyTransactionsClients
    );

    await expect(
      transactionPluggy.buscaTransacoesDaConta(
        "apiKey",
        info.accountId,
        info.itemId
      )
    ).rejects.toThrow(
      "Erro na busca da informação: Error Inesperado na comunicação com a Pluggy: Network error"
    );
  });

  it("deve retornar um erro de token", async () => {
    mockedPluggyTransactionsClients.BuscaTransacoesDaConta.mockRejectedValue(
      "Error Inesperado na comunicação com a Pluggy: Missing or invalid authorization token"
    );

    const transactionPluggy = new TransactionPluggy(
      mockedPluggyTransactionsClients
    );

    await expect(
      transactionPluggy.buscaTransacoesDaConta(
        "apiKey",
        info.accountId,
        info.itemId
      )
    ).rejects.toThrow(
      "Erro na busca da informação: Error Inesperado na comunicação com a Pluggy: Missing or invalid authorization token"
    );
  });
});
