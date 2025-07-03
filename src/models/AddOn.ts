import mongoose, { Schema, Document, models, model, Types } from "mongoose";

export interface IAddOn extends Document {
  name: string;
  price: number;
  merchant: Types.ObjectId;
}

const AddOnSchema = new Schema<IAddOn>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: false, // Allow same add-on name for different merchants
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    merchant: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default models.AddOn || model<IAddOn>("AddOn", AddOnSchema);