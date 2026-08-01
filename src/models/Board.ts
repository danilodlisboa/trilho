import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBoard extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const BoardSchema: Schema<IBoard> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

export const Board: Model<IBoard> = mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);
