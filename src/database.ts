import { connect as mongooseConnect, connection } from "mongoose";

export const connect = async (
  urlDB: string = process.env.MONGOURL as string
): Promise<void> => {
  // conectado o server com o DB
  await mongooseConnect(urlDB);
  console.log("Conectado ao banco");
};

export const close = (): Promise<void> => connection.close();
// faz a desconexão do sistema
