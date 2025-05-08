import { Schema, Document } from 'mongoose';

export const UserSchema = new Schema({
  name: { type: String, required: true },
});

export interface User extends Document {
  _id: string;
  name: string;
}
