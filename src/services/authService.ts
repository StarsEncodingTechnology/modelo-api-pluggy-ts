import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@src/model/user";

export interface DecodedUserInterface extends Omit<User, "_id"> {
  id: string;
}
// mesma interface

export default class AuthService {
  // class aonde fica as rotas de Autenticação do usuario

  public static async hashPassword(
    // converte a string em o hash
    password: string,
    salt = 10
    // valor da criptografia
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  // essa public comentada caso vc quiser criar uma nova hash de
  // alteração de senha
  // ou até mesmo criar um novo usario

  public static async comparePassword(
    // compara se senha e hash batem'
    password: string,
    hashPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }

  public static generateToken(payload: object): string {
    // gera um token com base nos valores passados
    return jwt.sign(payload, process.env.SECRETKEYJWT as string, {
      // normalmente usado na .env
      // acessando ele com process.env.AUTHJWT
      expiresIn: "24h",
    });
  }

  public static decodeToken(token: string): DecodedUserInterface {
    // decodifica o token e verifica se ele é valido
    return jwt.verify(
      token,
      process.env.SECRETKEYJWT as string
    ) as DecodedUserInterface;
  }
}
