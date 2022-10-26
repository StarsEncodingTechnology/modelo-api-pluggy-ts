import { ClassMiddleware, Controller, Get } from "@overnightjs/core";
import { authMiddleware } from "@src/middlewares/auth";
import { Item } from "@src/model/item";
import { Request, Response } from "express";
import { BaseController } from ".";
import { AccountPluggy } from "@src/services/pluggyAccountService";
import { AuthPluggyService } from "@src/services/pluggyAuthService";

const authPluggy = new AuthPluggyService();
const accountPluggy = new AccountPluggy();

@Controller("account")
@ClassMiddleware(authMiddleware)
export class AccountController extends BaseController {
  @Get(":itemId?")
  public async recuperaItensDaConta(
    req: Request,
    res: Response
  ): Promise<Response | Error> {
    try {
      const itemId = req.params.itemId;

      if (!req.decoded?.id)
        return res.status(401).send({ code: 401, message: "JWT invalido" });

      if (!itemId) {
        const itens = await Item.find({ user: req.decoded.id });
        return res.status(200).send({ code: 200, results: itens });
      }

      const item = await Item.findOne({ itemId: itemId });

      if (!item)
        return res
          .status(400)
          .send({ code: 400, message: "item_id não cadastrado" });

      const apiKey = await authPluggy.processoDeBuscaDeTokenPluggy();
      // @TODO cache
      const results = await accountPluggy.processoDeBuscaDeContas(
        apiKey,
        item.itemId,
        item.id
      );

      // @TODO travar sem returno
      return res.status(200).send({ code: 200, results: results });
    } catch (e) {
      this.sendCreateUpdateErrorResponse(res, e);
      return e as Error;
    }
  }
}
