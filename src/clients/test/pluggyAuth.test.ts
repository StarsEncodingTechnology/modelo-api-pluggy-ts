import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});
// seta o dotenv para apontar para o test
import { PluggyAuth } from "@src/clients/pluggyAuth";

import * as HTTPUtil from "@src/util/request";

jest.mock("@src/util/request");
// moca request

describe("Testes pluggyAuth client", () => {
  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
    typeof HTTPUtil.Request
  >;
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
  // ambas as variaveis acima fazem a mocagem do HTTPUtil.Request
  // para conseguirmos especificarmos retornos da API
  // cortando contato com a API real

  it("deve retornar um token correto", async () => {
    mockedRequest.post.mockResolvedValue({
      data: {
        apiKey: "123456789",
      },
    } as HTTPUtil.Response);
    // seta o retorno da falsa chamada da API

    const pluggyAuth = new PluggyAuth(mockedRequest);
    const response = await pluggyAuth.buscaPluggyTokenAutenticado();
    expect(response).toEqual(expect.any(String));
  });

  it("deve retornar um erro generico caso a requisão falhe antes de alcançar a API externa", async () => {
    mockedRequest.post.mockRejectedValue({ message: "Network error" });

    const pluggyAuth = new PluggyAuth(mockedRequest);
    await expect(pluggyAuth.buscaPluggyTokenAutenticado()).rejects.toThrow(
      "Error Inesperado na comunicação com a Pluggy: Network error"
    );
  });

  it("deve retornar um erro quando credencias invalidas", async () => {
    MockedRequestClass.isRequestError.mockReturnValue(true);
    mockedRequest.post.mockRejectedValue({
      message: "Client keys are invalid",
      code: 401,
    });
    // erro quando as keys estão invalidas

    const pluggyAuth = new PluggyAuth(mockedRequest);
    await expect(pluggyAuth.buscaPluggyTokenAutenticado()).rejects.toThrow(
      "Error Inesperado na comunicação com a Pluggy: Client keys are invalid"
    );
  });
});
