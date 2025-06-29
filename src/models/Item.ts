import mongoose, { Schema, Document, Types } from "mongoose";

export interface IItemImage {
  url: string;
  public_id: string;
}

export interface IItemAddOn {
  name: string;
  price: number;
}

export interface IItem extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  availability: boolean;
  image: IItemImage[];
  merchant: Types.ObjectId;
  category: Types.ObjectId;
  subCategories: Types.ObjectId[];
  addOns: IItemAddOn[];
  createdAt: Date;
  updatedAt: Date;
}

const ItemImageSchema = new Schema<IItemImage>(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const ItemAddOnSchema = new Schema<IItemAddOn>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  //{ _id: false } 
);

const ItemSchema = new Schema<IItem>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    availability: { type: Boolean, required: true, default: true },
    image: { type: [ItemImageSchema], default: [] },
     merchant: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subCategories: [
      { type: Schema.Types.ObjectId, ref: "SubCategory", index: true },
    ],
    addOns: { type: [ItemAddOnSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Item ||
  mongoose.model<IItem>("Item", ItemSchema);
