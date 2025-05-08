// src/expenses/schemas/expense.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // Tự thêm createdAt và updatedAt
export class Expense extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
