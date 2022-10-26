import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});
// seta o dotenv para apontar para o test

import AuthService from "@src/services/authService";
import { authMiddleware } from "../auth";

describe("AuthMiddleware", () => {
  //teste unitarios de auth

  it("deve verificar o JWT e chama o next", () => {
    const jwtToken = AuthService.generateToken({ data: "fake" });
    // gera um jwtToken valido

    const reqFake = {
      headers: {
        "x-acess-token": jwtToken,
      },
    };
    // adiciona o x-acess-token ao headers

    const resFake = {};
    // define resFake como {}
    // só pra passar mesmo, pq n é utilizado

    const nextFake = jest.fn();
    // define nextFake como função de jest

    authMiddleware(reqFake, resFake, nextFake);

    expect(nextFake).toHaveBeenCalled();
    // espera que next esteja correto
  });

  it("deve retornar não autorizado se houver problema com o token", () => {
    const reqFake = {
      headers: {
        "x-acess-token": "invalid token",
      },
    };

    // define um token não valido

    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    // define resFake e send sendo mocado
    // para conseguirmos ler os send e status

    const nextFake = jest.fn();

    authMiddleware(reqFake, resFake as Object, nextFake);
    // authMiddleware para o reqFake

    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: "jwt malformed",
    });
    // expera que sendMock ter sido chamdado com code 401
  });

  it("deve retornar não autorizado se houver problema com o token", () => {
    const reqFake = {
      headers: {},
    };
    // não define headers

    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };
    const nextFake = jest.fn();
    authMiddleware(reqFake, resFake as Object, nextFake);

    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: "jwt must be provided",
    });
    // deve retonar erro 401 caso não exista o token headers
  });
});
