import { SetupServer } from "@src/server";
import supertest from "supertest";
import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

let server: SetupServer;

beforeAll(async () => {
  // a chamada antes de tudo acontecer

  server = new SetupServer();
  // cria um novo OBJ setupServer
  // que é a configuração do servidor
  await server.init();
  // inicia o servidor
  global.testRequest = supertest(server.getApp);
  // coloca valor no testRequest
  // sendo ele o app() do servidor
});

afterAll(async() => await server.close());
