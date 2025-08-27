import mongoose, { Schema, Document } from "mongoose";

export interface IOrderCounter extends Document {
  _id: string;         // Composite key: merchantId_YYYYMMDD
  seq: number;
  createdAt?: Date;    // For TTL index
}

const OrderCounterSchema = new Schema<IOrderCounter>({
  _id: { type: String, required: true }, // e.g., "merchantId_20250829"
  seq: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// TTL index: expire after 3 days
OrderCounterSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 }); // 3 days auto-expire will be delete by mongoDB

export default mongoose.models.OrderCounter ||
  mongoose.model<IOrderCounter>("OrderCounter", OrderCounterSchema);