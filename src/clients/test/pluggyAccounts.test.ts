import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});
// seta o dotenv para apontar para o test
import { PluggyAccount } from "@src/clients/pluggyAccounts";

import dadosCorretos from "@test/fixtures/retornoAccounts.json";

import * as HTTPUtil from "@src/util/request";

jest.mock("@src/util/request");
// moca request

describe("Teste pluggy Rota de Account", () => {
  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
  // ambas as variaveis acima fazem a mocagem do HTTPUtil.Request
  // para conseguirmos especificarmos retornos da API
  // cortando contato com a API real

  it("deve retornar a lista correta de bancos", async () => {
    mockedRequest.get.mockResolvedValue({
      data: dadosCorretos,
    } as HTTPUtil.Response);

    const pugglyAccount = new PluggyAccount(mockedRequest);
    const response = await pugglyAccount.BuscaContasDoItem("API-KEY-FAKE", "1");
    expect(response).toEqual({
      id: "fd7a9a5e-0a6e-490b-baa7-7cb694ab7411",
      type: "BANK",
      subtype: "CHECKING_ACCOUNT",
      name: "Conta corrente",
      balance: 1234.25,
      currencyCode: "BRL",
      itemId: "f019ca37-c109-4e1c-91f6-f8134dbd1788",
      number: "0001/12345-0",
      marketingName: null,
      taxNumber: "38.512.121/0001-95",
      owner: "PLUGGY INC.",
      bankData: {
        transferNumber: "0001/12345-0",
        closingBalance: null,
      },
      creditData: null,
    });
  });

  it("deve retornar um erro caso falha a conexão", async () => {
    mockedRequest.get.mockRejectedValue({ message: "Network error" });

    const pugglyAccount = new PluggyAccount(mockedRequest);
    await expect(
      pugglyAccount.BuscaContasDoItem("API-KEY-FAKE", "1")
    ).rejects.toThrow(
      "Error Inesperado na comunicação com a Pluggy: Network error"
    );
  });

  it("deve retornar um erro caso o API-KEY invalido", async () => {
    MockedRequestClass.isRequestError.mockReturnValue(true);
    mockedRequest.get.mockRejectedValue({
      code: 403,
      message: "Missing or invalid authorization token",
    });
    // erro quando as keys estão invalidas

    const pugglyAccount = new PluggyAccount(mockedRequest);
    await expect(
      pugglyAccount.BuscaContasDoItem("API-KEY-FAKE", "1")
    ).rejects.toThrow(
      "Error Inesperado na comunicação com a Pluggy: Missing or invalid authorization token"
    );
  });
});
