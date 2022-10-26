import { CUSTOM_VALIDATION } from "@src/model/user";
import { Response } from "express";
import mongoose from "mongoose";

// é usada para TABELAR todos os erros das possiveis rotas

export abstract class BaseController {
  // base dos controlers e casos de erro
  protected sendCreateUpdateErrorResponse(res: Response, error: unknown): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      res
        .status(clientErrors.code)
        .send({ code: clientErrors.code, error: clientErrors.error });
    } else {
      console.log(error);
      res.status(500).send({ code: 500, error: "Something went wrong!" });
    }
  }

  private handleClientErrors(error: mongoose.Error.ValidationError): {
    code: number;
    error: string;
  } {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) =>
        err.name === "ValidatorError" &&
        err.kind === CUSTOM_VALIDATION.DUPLICATED
    );
    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    }
    return { code: 422, error: error.message };
  }

  protected SendErrorResponse(res: Response, error: any): Response {
    return res
      .status(error.code)
      .send({ code: error.code, message: error.message });
  }
}
