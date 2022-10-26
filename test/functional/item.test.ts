import { Item } from "@src/model/item";
import { User } from "@src/model/user";
import AuthService from "@src/services/authService";

describe("Test functional rota Item", () => {
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
  });

  describe("quando criar item", () => {
    it("Deve criar item com sucesso", async () => {
      const item = {
        user: "user-ok",
        password: "password-ok",
        connectorId: 8,
      };

      const response = await global.testRequest
        .post("/item")
        .set({ "x-acess-token": token })
        .send(item);

      expect(response.status).toBe(201);
    });

    it("deve retornar um erro 422 quando há um erro de validação", async () => {
      const item = {
        user: "user-ok",
        password: "password-ok",
      };

      const response = await global.testRequest
        .post("/item")
        .set({ "x-acess-token": token })
        .send(item);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        message: "conectorId is requided",
      });
    });
  });
});
