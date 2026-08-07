import mongoose, { Schema, Document, Model } from 'mongoose';

export type CustomFieldType = 'text' | 'number' | 'select' | 'date';

export interface ICustomFieldDefinition extends Document {
  _id: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  name: string;
  fieldType: CustomFieldType;
  options: string[];
  isDefault: boolean;
  defaultValue?: string;
  createdAt: Date;
}

const CustomFieldDefinitionSchema: Schema<ICustomFieldDefinition> = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    name: { type: String, required: true },
    fieldType: { type: String, enum: ['text', 'number', 'select', 'date'], required: true },
    options: { type: [String], default: [] },
    isDefault: { type: Boolean, default: false },
    defaultValue: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const CustomFieldDefinition: Model<ICustomFieldDefinition> =
  mongoose.models.CustomFieldDefinition ||
  mongoose.model<ICustomFieldDefinition>('CustomFieldDefinition', CustomFieldDefinitionSchema);
