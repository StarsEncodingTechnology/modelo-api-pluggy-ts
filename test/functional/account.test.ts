import { Item } from "@src/model/item";
import { User } from "@src/model/user";
import AuthService from "@src/services/authService";

describe("teste funcional rota account", () => {
  const defaultUser = {
    name: "pedro elias",
    email: "star@encodingstars.com",
    password: "1234",
  };

  let token: string;
  beforeEach(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());
    await new Item({
      user: user._id,
      itemId: "87404422-f6fe-40f0-8a99-0e142712389a",
      nameBank: "Pluggy Bank BR Business",
    }).save();
  });

  afterAll(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
  });

  describe("Testes com a lista", () => {
    it("deve retornar a lista de contas cadastradas", async () => {
      const response = await global.testRequest
        .get("/account")
        .set({ "x-acess-token": token });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        code: 200,
        results: [
          {
            id: expect.any(String),
            user: expect.any(String),
            itemId: "87404422-f6fe-40f0-8a99-0e142712389a",
            nameBank: "Pluggy Bank BR Business",
          },
        ],
      });
    });

    it("deve retornar vazio a lista de contas cadastradas", async () => {
      await Item.deleteMany({});
      const response = await global.testRequest
        .get("/account")
        .set({ "x-acess-token": token });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ code: 200, results: [] });
    });

    it("deve retornar um erro 401 quando o JWT estiver com falha", async () => {
      await Item.deleteMany({});
      const response = await global.testRequest
        .get("/account")
        .set({ "x-acess-token": "asd" });

      expect(response.status).toBe(401);
    });
  });

  describe("Teste com um unico", () => {
    it("deve retornar os dados especificos do banco", async () => {
      const response = await global.testRequest
        .get("/account/87404422-f6fe-40f0-8a99-0e142712389a")
        .set({ "x-acess-token": token });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        code: 200,
        results: {
          id: expect.any(String),
          type: "BANK",
          subtype: expect.any(String),
          name: "Conta corrente",
          balance: expect.any(Number),
          currencyCode: "BRL",
          itemId: "87404422-f6fe-40f0-8a99-0e142712389a",
          bankData: expect.any(Object),
          number: expect.any(String),
          marketingName: null,
          taxNumber: "38.512.121/0001-95",
          owner: expect.any(String),
          creditData: null,
        },
      });
    });

    it("deve retornar erro 400", async () => {
      const response = await global.testRequest
        .get("/account/nao-existe")
        .set({ "x-acess-token": token });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: 400,
        message: "item_id não cadastrado",
      });
    });
  });
});
