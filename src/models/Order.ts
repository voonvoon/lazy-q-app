import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrder extends Document {
  items: any[]; // You can define a more specific type if you have one
  merchantId: Types.ObjectId;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    state?: string;
    postcode?: string;
    city?: string;
  };
  delivery: boolean;
  deliveryFee: number;
  tax: {
    rate: number;
    totalTax: number;
  };
  discount?: any; // Use a specific type if you have one
  discountAmount?: number;
  subTotal?: number; // before tax, discount and delivery
  totalAmount: number;
  tranID: string;
  orderid: string;
  paymentStatus: string;
  paymentMeta?: any;
  status: string;
  notes?: string;
  receiptNo?: string;
  orderSequentialNoForDay?: string;
  pickTime?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    items: { type: Schema.Types.Mixed, required: true }, // field can be any type (array, object, etc)
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      state: { type: String },
      postcode: { type: String },
      city: { type: String },
    },
    delivery: { type: Boolean, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: {
      rate: { type: Number, default: 0 },
      totalTax: { type: Number, default: 0 },
    },
    discount: { type: Schema.Types.Mixed },
    discountAmount: { type: Number },
    subTotal: { type: Number },
    pickTime: { type: String },
    totalAmount: { type: Number, required: true },
    tranID: { type: String, required: true },
    orderid: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    paymentMeta: { type: Schema.Types.Mixed },
    status: { type: String, default: "new" }, // new, preparing, ready, completed, cancelled
    notes: { type: String },
    receiptNo: { type: String },
    orderSequentialNoForDay: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
