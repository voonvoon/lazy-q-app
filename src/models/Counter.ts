import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICounter extends Document {
  _id: Types.ObjectId; // Use merchantId as the _id
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: Schema.Types.ObjectId, required: true }, // merchantId
  seq: { type: Number, default: 0 },
});

export default mongoose.models.Counter ||
  mongoose.model<ICounter>("Counter", CounterSchema);