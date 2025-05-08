import { Schema, Document } from 'mongoose';

export const FixedCostSchema = new Schema({
  month: { type: String, required: true, unique: true },
  roomCost: {
    type: Number,
    required: true,
    default: 4300000,
    immutable: true, // Không thể thay đổi sau khi được set
  },
  serviceFee: { type: Number, required: true },
});

export interface FixedCost extends Document {
  _id: string;
  month: string;
  roomCost: number; // Luôn là 4300000
  serviceFee: number;
}
