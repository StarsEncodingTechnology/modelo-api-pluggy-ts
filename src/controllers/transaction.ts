import { ClassMiddleware, Controller, Get } from "@overnightjs/core";
import { authMiddleware } from "@src/middlewares/auth";
import { Item } from "@src/model/item";
import { Transaction } from "@src/model/transaction";
import { AuthPluggyService } from "@src/services/pluggyAuthService";
import { TransactionPluggy } from "@src/services/pluggyTransactionService";
import { Request, Response } from "express";
import { BaseController } from ".";

const transactionPluggy = new TransactionPluggy();
const authPluggy = new AuthPluggyService();

@Controller("transaction")
@ClassMiddleware(authMiddleware)
export class TransactionsControllers extends BaseController {
  @Get(":transactionId?")
  public async BuscaInfoTransacoes(
    req: Request,
    res: Response
  ): Promise<Response | Error> {
    const transactionId = req.params.transactionId;
    const itemId = req.query.itemId || req.query.itemid;

    try {
      if (!transactionId && !itemId)
        return res
          .status(402)
          .send({ code: 402, message: "Não foi encontrado nenhum parametro" });

      if (transactionId) {
        const transaction = await Transaction.findOne({ transactionId });
        if (transaction)
          return res.status(200).send({ code: 200, results: transaction });
        return res.status(404).send({ code: 404, message: "Não encontrado" });
      }

      const apiKey = await authPluggy.processoDeBuscaDeTokenPluggy();
      // não é interessante sempre q precisar fazer uma solicitação na pluggy
      // fazer a requisição, o token tem valida de 2 horas

      //------------- está parte do codigo precisa ser alterada
      //pois está como padrão somente a conta bank
      const item = await Item.findOne({ itemId: itemId });
      console.log({ item });
      if (!item?.bankAccountId)
        // @TODO está retornando somente BANK
        return res.status(404).send({
          code: 404,
          message: "Conta não encontrada, tente pelo rota de accounts",
        });

      const dados = await transactionPluggy.buscaTransacoesDaConta(
        apiKey,
        item.bankAccountId,
        item._id
      );

      return res.status(200).send({ code: 200, results: dados });
    } catch (e) {
      this.sendCreateUpdateErrorResponse(res, e);
      return e as Error;
    }
  }
}
