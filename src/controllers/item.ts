import { ClassMiddleware, Controller, Post } from "@overnightjs/core";
import { authMiddleware } from "@src/middlewares/auth";
import { AuthPluggyService } from "@src/services/pluggyAuthService";
import { ItensPluggyService } from "@src/services/pluggyItensService";
import { Request, Response } from "express";
import { BaseController } from ".";

const authPluggy = new AuthPluggyService();
const itensPluggy = new ItensPluggyService();

@Controller("item")
@ClassMiddleware(authMiddleware)
export class ItemControllers extends BaseController {
  // @TODO esse controler precisa de um item que é de ver
  // seguiu tudo certo a autenticação via API junto da pluggy
  // se o usuario digitou a senha correta e seguintes

  @Post("")
  public async criaItem(
    req: Request,
    res: Response
  ): Promise<Response | Error> {
    try {
      const { user, password, connectorId } = req.body;
      // @TODO isso é padrão para o conecctorID 8

      if (!user)
        return res.status(422).send({ code: 422, message: "user is requided" });
      else if (!password)
        return res
          .status(422)
          .send({ code: 422, message: "password is requided" });
      else if (!connectorId)
        return res
          .status(422)
          .send({ code: 422, message: "conectorId is requided" });

      const apiKey = await authPluggy.processoDeBuscaDeTokenPluggy();
      // cria uma API KEY da pluggy
      // isso é uma má pratica, a KEY tem duração de 2 horas poderiamos armazena-la
      // em cache localmente para possiveis requisições futuras
      // recomendo utilizar https://www.npmjs.com/package/node-cache
      // para projetos pequenos

      if (req.decoded?.id) {
        // refaz o teste se autenticado
        // para não validar
        const response = await itensPluggy.processoDeCriacaoItem(
          req.decoded?.id,
          user,
          password,
          connectorId,
          apiKey
        );
        if (response)
          return res
            .status(201)
            .send({ code: 201, message: "Item criado com sucesso" });
        else return res.send(500).send({ code: 500, error: "Erro interno" });
      } else {
        return res.status?.(401).send({
          code: 401,
          error: "Falha no JWT de Autenticação",
        });
      }
    } catch (e) {
      // @TODO isso aqui não pode ocorrer
      // captura de erro unitario
      this.sendCreateUpdateErrorResponse(res, e);
      return e as Error;
    }
  }
}
