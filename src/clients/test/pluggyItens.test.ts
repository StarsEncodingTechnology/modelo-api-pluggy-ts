import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});
// seta o dotenv para apontar para o test
import dadosCorretos from "@test/fixtures/retornoRotaItemPluggy.json";

import * as HTTPUtil from "@src/util/request";
import { PluggyItens } from "@src/clients/pluggyItens";

jest.mock("@src/util/request");
// moca request

describe("Teste pluggy itens", () => {
  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
  // ambas as variaveis acima fazem a mocagem do HTTPUtil.Request
  // para conseguirmos especificarmos retornos da API
  // cortando contato com a API real

  it("deve retornar a lista correta de bancos", async () => {
    mockedRequest.post.mockResolvedValue({
      data: dadosCorretos,
    } as HTTPUtil.Response);

    const pluggyItens = new PluggyItens(mockedRequest);
    const response = await pluggyItens.CriaConexaoPluggyBanco(
      "API-KEY-FAKE",
      "user-ok",
      "password-ok",
      8
    );
    expect(response).toEqual({
      nameBank: "Pluggy Bank BR Business",
      itemId: "026498fc-877a-469f-9192-b71142eb728c",
      idBank: 8,
      status: "UPDATING",
      executionStatus: "CREATED",
      error: "",
      ultimaAtt: "2022-10-21T17:06:50.049Z",
    });
  });

  it("deve retornar um erro caso falha a  xão", async () => {
    mockedRequest.post.mockRejectedValue({ message: "Network error" });

    const pluggyItens = new PluggyItens(mockedRequest);
    await expect(
      pluggyItens.CriaConexaoPluggyBanco(
        "API-KEY-FAKE",
        "user-ok",
        "password-ok",
        8
      )
    ).rejects.toThrow(
      "Error Inesperado na comunicação com a Pluggy: Network error"
    );
  });

  it("deve retornar um erro caso o API-KEY invalido", async () => {
    MockedRequestClass.isRequestError.mockReturnValue(true);
    mockedRequest.post.mockRejectedValue({
      code: 403,
      message: "Missing or invalid authorization token",
    });
    // erro quando as keys estão invalidas

    const pluggyItens = new PluggyItens(mockedRequest);
    await expect(
      pluggyItens.CriaConexaoPluggyBanco(
        "API-KEY-FAKE",
        "user-ok",
        "password-ok",
        8
      )
    ).rejects.toThrow(
      "Error Inesperado na comunicação com a Pluggy: Missing or invalid authorization token"
    );
  });
});
