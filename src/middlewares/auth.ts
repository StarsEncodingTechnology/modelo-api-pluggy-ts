import { NextFunction, Request, Response } from "express";
import Authservice from "@src/services/authService";

// isso é um middleware de autenticação
// ele é executado antes de qualquer rota que ele for declarado

// faz o test do token
export function authMiddleware(
  req: Partial<Request>,
  // parcial vc está dizendo que pode vir é algo que n é  exatamente aquilo
  res: Partial<Response>,
  next: NextFunction
): void {
  const token = req.headers?.["x-acess-token"];
  // captura o token no header para checar validez
  try {
    const decoded = Authservice.decodeToken(token as string);
    // decoda o token
    // faz o decoced do token e checa se valido

    req.decoded = decoded;
    // adiciona os dados no decoded
    // para conseguir acessar via req.
    next("");
  } catch (err) {
    // caso aconteceça algo retorna o motivo
    res.status?.(401).send({
      code: 401,
      error: (err as Error).message,
    });
  }
}
