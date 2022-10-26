import "./util/module-alias";
// importa o alias para facilitar a importação
// com @src

import * as dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

import { Server } from "@overnightjs/core";
// importar a class server direto do overnigth
// overnigth é um facilitador baseado no express

import * as database from "@src/database";
// busca conexão do DB

import express, { Application } from "express";
import { UsersController } from "./controllers/user";
import { ItemControllers } from "./controllers/item";
import { AccountController } from "./controllers/account";
import { TransactionsControllers } from "./controllers/transaction";

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
    // por ser uma class extendida de outra
    // necessi
  }

  public async init(): Promise<void> {
    // inicia a aplicação com base em privates separados
    this.setupExpress();
    this.setupControllers();
    await this.setupDatabase();
  }

  private setupExpress(): void {
    this.app.use(express.json());
    // seta que a "conversa" com o sistema vai ser feita em JSON
    // this.app.use(expressPino({ logger}))
  }

  private setupControllers(): void {
    const userController = new UsersController();
    const itemController = new ItemControllers();
    const accountController = new AccountController();
    const transactionController = new TransactionsControllers();
    this.addControllers([
      userController,
      itemController,
      accountController,
      transactionController,
    ]);
  }

  private async setupDatabase(): Promise<void> {
    await database.connect();
  }

  get getApp(): Application {
    // função do tipo get não precisam de chaves para charem chamados
    // const app = getApp
    return this.app;
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Iniciado em : ${this.port}`);
    });
  }
}