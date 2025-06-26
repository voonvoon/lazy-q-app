import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubCategory extends Document {
  name: string;
  slug: string;
  merchant: Types.ObjectId; // Reference to Merchant
  parentCategory: Types.ObjectId; // Reference to Category
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    merchant: { type: Schema.Types.ObjectId, ref: "Merchant", required: true , index: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category", required: true , index: true},
  },
  { timestamps: true }
);

export default mongoose.models.SubCategory ||
  mongoose.model<ISubCategory>("SubCategory", SubCategorySchema);