import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBoardInvitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy?: string;
  createdAt: Date;
}

export interface IBoard extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  invitations: IBoardInvitation[];
  createdAt: Date;
}

const BoardInvitationSchema = new Schema({
  id: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  invitedBy: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const BoardSchema: Schema<IBoard> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    invitations: [BoardInvitationSchema],
  },
  {
    timestamps: true,
  }
);

export const Board: Model<IBoard> = mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);
