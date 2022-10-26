import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});
// seta o dotenv para apontar para o test
import { PluggyConectors } from "@src/clients/pluggyConnectors";

import dadosCorretos from "@test/fixtures/retornoListaBancos.json";

import * as HTTPUtil from "@src/util/request";

jest.mock("@src/util/request");
// moca request

describe("Teste pluggy lista banco", () => {
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

    const pluggyConectors = new PluggyConectors(mockedRequest);
    const response = await pluggyConectors.buscaListaDeBancosDisponiveis(
      "API-KEY-FAKE"
    );
    expect(response).toEqual(dadosCorretos);
  });

  it("deve retornar um erro caso falha a conexão", async () => {
    mockedRequest.get.mockRejectedValue({ message: "Network error" });

    const pluggyConectors = new PluggyConectors(mockedRequest);
    await expect(
      pluggyConectors.buscaListaDeBancosDisponiveis("API-KEY-FAKE")
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

    const pluggyConectors = new PluggyConectors(mockedRequest);
    await expect(
      pluggyConectors.buscaListaDeBancosDisponiveis("API-KEY-FAKE")
    ).rejects.toThrow(
      "Error Inesperado na comunicação com a Pluggy: Missing or invalid authorization token"
    );
  });
});
