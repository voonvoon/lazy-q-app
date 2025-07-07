import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDiscount extends Document {
  code: string;
  type: "amount" | "percentage";
  value: number;
  expiryDate: Date;
  merchant: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code: { type: String, required: true },
    type: { type: String, enum: ["amount", "percentage"], required: true },
    value: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    merchant: { type: Schema.Types.ObjectId, ref: "Merchant", required: true },
  },
  { timestamps: true }
);

//codes are unique per merchant
//creates compound unique index on combination of merchant and code.
//Each merchant can have own discount codes (e.g. both A and B can have a code "SAVE10").
//{ merchant: 1, code: 1 } = index built on both fields (order doesn’t matter for uniqueness).
DiscountSchema.index({ merchant: 1, code: 1 }, { unique: true });

export default mongoose.models.Discount ||
  mongoose.model<IDiscount>("Discount", DiscountSchema);