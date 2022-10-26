import { Item } from "@src/model/item";
import { Transaction } from "@src/model/transaction";
import { User } from "@src/model/user";
import AuthService from "@src/services/authService";

import retornoCorretoPluggy from "@test/fixtures/transactions/retornoCorretoPluggyTransactions.json";

describe("Testes funcionais na rota de transactions", () => {
  const defaultUser = {
    name: "pedro elias",
    email: "star@encodingstars.com",
    password: "1234",
  };

  let token: string;
  let itemIdMongoose: string;
  beforeEach(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    await Transaction.deleteMany({});
    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());
    const item = await new Item({
      user: user._id,
      itemId: "87404422-f6fe-40f0-8a99-0e142712389a",
      nameBank: "Pluggy Bank BR Business",
      bankAccountId: "8b5c48af-4063-4728-a1e0-8e08d2afdee6",
    }).save();

    itemIdMongoose = item._id.toString();
  });

  afterAll(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    await Transaction.deleteMany({});
  });

  describe("Rota de buscar lista de transacoes", () => {
    it("deve retornar a lista de transações corretas", async () => {
      const response = await global.testRequest
        .get("/transaction/?itemid=87404422-f6fe-40f0-8a99-0e142712389a")
        .set({ "x-acess-token": token });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        code: 200,
        results: expect.any(Array),
      });
    });

    it("deve retornar um erro 401 quando o jwt não estiver valido", async () => {
      const response = await global.testRequest
        .get("/transaction")
        .set({ "x-acess-token": "nao-valido" });

      expect(response.status).toBe(401);
    });
  });

  describe("rota de busca unica transação", () => {
    it("deve retornar os dados de uma transação", async () => {
      await new Transaction({
        _id: "635925d5abf7038dd1083518",
        itemIdMongoose: itemIdMongoose,
        accountId: "8b5c48af-4063-4728-a1e0-8e08d2afdee6",
        transactionId: "06c2b57f-0f49-4789-85ff-484ec2a3c78f",
        description: "CXE SAQUE 000091.001008",
        descriptionRaw: "Saque realizado no caixa eletrônico.",
        amount: -300,
        type: "DEBIT",
        date: "2022-09-12T03:00:00.000Z",
        category: "Same person transfer - CASH",
        balance: 1234.25,
        payerDoc: "",
        receiverDoc: "",
      }).save();

      const response = await global.testRequest
        .get("/transaction/06c2b57f-0f49-4789-85ff-484ec2a3c78f")
        .set({ "x-acess-token": token });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        code: 200,
        results: {
          id: "635925d5abf7038dd1083518",
          accountId: "8b5c48af-4063-4728-a1e0-8e08d2afdee6",
          transactionId: "06c2b57f-0f49-4789-85ff-484ec2a3c78f",
          itemIdMongoose: itemIdMongoose,
          description: "CXE SAQUE 000091.001008",
          descriptionRaw: "Saque realizado no caixa eletrônico.",
          amount: -300,
          date: "2022-09-12T03:00:00.000Z",
          category: "Same person transfer - CASH",
          balance: 1234.25,
          type: "DEBIT",
          payerDoc: "",
          receiverDoc: "",
        },
      });
    });

    it("deve retornar erro 404 quando não encontrar a transação", async () => {
      const response = await global.testRequest
        .get("/transaction/nao-encontrar")
        .set({ "x-acess-token": token });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ code: 404, message: "Não encontrado" });
    });
  });

  it("deve retornar erro 402 quando nenhuma parametro é passado", async () => {
    const response = await global.testRequest
      .get("/transaction/")
      .set({ "x-acess-token": token });

    expect(response.status).toBe(402);
  });
});
