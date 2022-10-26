import mongoose, { Document } from "mongoose";
import Authservice from "@src/services/authService";

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = "DUPLICATED",
}

interface UserModel extends Omit<User, "_id">, Document {}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

schema.path("email").validate(
  async (email: string) => {
    const emailCount = await mongoose.models.User.countDocuments({ email });
    return !emailCount;
  },
  "already exists in the database.",
  CUSTOM_VALIDATION.DUPLICATED
);
// trás o erro da informação duplicada para a camada do mongoose
// fazendo ele parar de retornar um erro diretamenta do MongoDB

schema.pre<UserModel>("save", async function (): Promise<void> {
  if (!this.password || !this.isModified("password")) {
    return;
  }

  try {
    const hashedPassword = await Authservice.hashPassword(this.password);
    this.password = hashedPassword;
  } catch (err) {
    console.error(`Erro no hash do password do usuario ${this.name}`);
    // @TODO ERRO
  }
});

export const User = mongoose.model<UserModel>("User", schema);
