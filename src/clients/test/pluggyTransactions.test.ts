import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

import * as HTTPUtil from "@src/util/request";

import dadosCorretosRetornoListPluggyTransactions from "@test/fixtures/transactions/retornoCorretoPluggyTransactions.json";
import dadosCorretosTransactionsList from "@test/fixtures/transactions/retornarTransactationsList.json";
import { Pluggytransactions } from "../pluggyTransactions";

jest.mock("@src/util/request");

describe("Teste pluggy Rota Transactions", () => {
  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
  // ambas as variaveis acima fazem a mocagem do HTTPUtil.Request
  // para conseguirmos especificarmos retornos da API
  // cortando contato com a API real

  describe("Teste na rota de buscar transactions", () => {
    it("deve retornar os dados corretos", async () => {
      mockedRequest.get.mockResolvedValue({
        data: dadosCorretosTransactionsList,
      } as HTTPUtil.Response);

      const pluggytransactions = new Pluggytransactions(mockedRequest);
      const response = await pluggytransactions.BuscaTransacoesDaConta(
        "API-KEY-FAKE",
        "account-id"
      );

      expect(response).toEqual(dadosCorretosRetornoListPluggyTransactions);
    });
    it("deve retornar um erro caso falha a conexão", async () => {
      mockedRequest.get.mockRejectedValue({ message: "Network error" });

      const pugglyTransactions = new Pluggytransactions(mockedRequest);
      await expect(
        pugglyTransactions.BuscaTransacoesDaConta("API-KEY-FAKE", "1")
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

      const pugglyTransactions = new Pluggytransactions(mockedRequest);
      await expect(
        pugglyTransactions.BuscaTransacoesDaConta("API-KEY-FAKE", "1")
      ).rejects.toThrow(
        "Error Inesperado na comunicação com a Pluggy: Missing or invalid authorization token"
      );
    });
  });

  describe("Teste na rota de atualizar categoria", () => {
    it("deve retornar true quando atualizar a categoria", async () => {
      mockedRequest.patch.mockResolvedValue({
        data: {
          id: "8b6b733f-5c3e-4ba6-88a4-b682a80ab61e",
          description: "PAGAMENTO CARTAO DE DEBITO GETNET-MAESTRO",
          descriptionRaw: null,
          currencyCode: "BRL",
          amount: 1435.64,
          date: "2022-08-10T03:00:00.000Z",
          category: "Entrepreneurial activities",
          balance: 633.47,
          accountId: "cf8503bc-632c-4056-9ebb-26bdbfc2d1d0",
          providerCode: null,
          status: "POSTED",
          paymentData: null,
          type: "CREDIT",
          creditCardMetadata: null,
          merchant: null,
        },
      } as HTTPUtil.Response);

      const pluggyTransactions = new Pluggytransactions(mockedRequest);
      const response = await pluggyTransactions.AtualizaTransacaoDaConta(
        "API-KEY-FAKE",
        "TRANSACTION-ID",
        "CATEGORY-ID"
      );

      expect(response).toBe(true);
    });

    it("deve retornar um erro generico caso a requisão falhe antes de alcançar a API externa", async () => {
      mockedRequest.patch.mockRejectedValue({ message: "Network error" });

      const pluggyTransactions = new Pluggytransactions(mockedRequest);
      await expect(
        pluggyTransactions.AtualizaTransacaoDaConta(
          "API-KEY",
          "TRANSACTIONS-ID",
          "CATEGORY"
        )
      ).rejects.toThrow(
        "Error Inesperado na comunicação com a Pluggy: Network error"
      );
    });

    it("deve retornar um erro Unexpected error quando algo der errado", async () => {
      MockedRequestClass.isRequestError.mockReturnValue(true);
      mockedRequest.patch.mockRejectedValue({
        message: "Unexpected error",
        code: 500,
      });

      const pluggyTransactions = new Pluggytransactions(mockedRequest);
      await expect(
        pluggyTransactions.AtualizaTransacaoDaConta("", "", "")
      ).rejects.toThrow(
        "Error Inesperado na comunicação com a Pluggy: Unexpected error"
      );
    });
  });
});
