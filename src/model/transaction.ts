import mongoose, { Document, Schema } from "mongoose";

export enum TypeTransaction {
  credit = "CREDIT",
  debit = "DEBIT",
}

export interface Transaction {
  _id?: string;
  itemIdMongoose: string;
  accountId: string;
  transactionId: string;
  description: string;
  descriptionRaw: string | null;
  amount: number;
  type: TypeTransaction;
  date: string;
  category: string;
  balance: number;
  payerDoc: string;
  receiverDoc: string;
}

const schema = new mongoose.Schema(
  {
    itemIdMongoose: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    accountId: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    descriptionRaw: { type: String || null, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ["CREDIT", "DEBIT"] },
    date: { type: String, required: true },
    category: { type: String, required: true },
    balance: { type: Number, required: true },
    payerDoc: { type: String },
    receiverDoc: { type: String },
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

interface TransactionModel extends Omit<Transaction, "_id">, Document {}

export const Transaction = mongoose.model<TransactionModel>(
  "Transaction",
  schema
);
