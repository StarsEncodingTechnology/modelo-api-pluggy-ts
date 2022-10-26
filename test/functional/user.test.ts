import { User } from "@src/model/user";
import AuthService from "@src/services/authService";

describe("Teste funcional user", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    // limpa teste DB
  });
  describe("Quando criar um novo usuario com a senha cripografada", () => {
    it("deve criar um novo usuario", async () => {
      const newUser = {
        name: "Pedro Elias",
        email: "star@encodingstars.com",
        password: "StarsSenhaTeste1234!@#$",
      };

      const response = await global.testRequest.post("/users").send(newUser);
      expect(response.status).toBe(201);
      await expect(
        AuthService.comparePassword(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) },
        })
      );
    });

    it("deve retornar um erro 422 quando acontece um erro na validação", async () => {
      const newUser = {
        email: "john@mail.com",
        password: "StarsSenhaErrada",
      };

      const response = await global.testRequest.post("/users").send(newUser);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: "User validation failed: name: Path `name` is required.",
      });
    });

    it("deve retornar 409 quando o email já existir", async () => {
      const newUser = {
        name: "Pedro Elias",
        email: "star@encodingstars.com",
        password: "StarsSenhaTeste1234!@#$",
      };

      await global.testRequest.post("/users").send(newUser);
      const response = await global.testRequest.post("/users").send(newUser);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: "User validation failed: email: already exists in the database.",
      });
    });
  });

  describe("Teste rotas de User autenticar", () => {
    it("deve gerar token para o usuario valido", async () => {
      const user = {
        name: "Stars Encoding Technology",
        email: "star@encodingstars.com",
        password: "StarsSenhaTeste1234!@#$",
      };

      await new User(user).save();
      const { body } = await global.testRequest
        .post("/users/authenticate")
        .send({
          email: user.email,
          password: user.password,
        });

      expect(body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it("deve retornar não autorizado se a senha não bater", async () => {
      const user = {
        name: "Stars Encoding Technology",
        email: "star@encodingstars.com",
        password: "senha.incorreta",
      };

      await new User(user).save();
      const { status } = await global.testRequest
        .post("/users/authenticate")
        .send({ email: user.email, password: "senha-diferente" });

      expect(status).toBe(401);
    });
  });
});
