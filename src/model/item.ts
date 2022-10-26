import mongoose, { Document, Schema } from "mongoose";

export interface Item {
  _id: string;
  itemId: string;
  nameBank: string;
  bankAccountId?: string;
  creditAccountId?: string;
  AlternativeAccountId?: string;
  user: string;
}

const schema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
    itemId: { type: String, require: true, unique: true },
    nameBank: { type: String, require: true },
    bankAccountId: { type: String, require: false },
    AlternativeAccountId: { type: String, require: false },
    creditAccountId: { type: String, require: false },
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

interface ItemModel extends Omit<Item, "_id">, Document {}

export const Item = mongoose.model<ItemModel>("Item", schema);
