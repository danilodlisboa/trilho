import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ICard extends Document {
  _id: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  assigneeId?: mongoose.Types.ObjectId;
  checklist: IChecklistItem[];
  order: number;
  createdAt: Date;
}

const ChecklistItemSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const CardSchema: Schema<ICard> = new Schema(
  {
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true, index: true },
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    dueDate: { type: Date, default: null },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    checklist: [ChecklistItemSchema],
    order: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

CardSchema.index({ columnId: 1, order: 1 });

export const Card: Model<ICard> = mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema);
