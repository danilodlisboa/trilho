import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IColumn extends Document {
  _id: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
}

const ColumnSchema: Schema<IColumn> = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Column: Model<IColumn> = mongoose.models.Column || mongoose.model<IColumn>('Column', ColumnSchema);
