import mongoose, { Schema, Document } from 'mongoose';

export interface IResellerProduct extends Document {
  resellerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  markup: number;
  enabled: boolean;
  customDescription?: string;
  customGuide?: string;
  customRegion?: string;
  customImportantNote?: string;
  layout: {
    fieldOrder: string[];
    showDescription: boolean;
    showGuide: boolean;
    showRegion: boolean;
    showImportantNote: boolean;
  };
  customFields?: {
    name: string;
    type: 'text' | 'number' | 'boolean';
    required: boolean;
    label: string;
  }[];
  customSubProducts?: {
    originalId: string;
    name: string;
    enabled: boolean;
    stockQuantity?: number;
  }[];
  featured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResellerProductSchema = new Schema<IResellerProduct>({
  resellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  markup: { type: Number, required: true, min: 0, default: 20 },
  enabled: { type: Boolean, default: true },
  customDescription: String,
  customGuide: String,
  customRegion: String,
  customImportantNote: String,
  layout: {
    fieldOrder: {
      type: [String],
      default: ['title', 'description', 'variants', 'guide', 'importantNote']
    },
    showDescription: { type: Boolean, default: true },
    showGuide: { type: Boolean, default: true },
    showRegion: { type: Boolean, default: true },
    showImportantNote: { type: Boolean, default: true }
  },
  customFields: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['text', 'number', 'boolean'], required: true },
    required: { type: Boolean, required: true },
    label: { type: String, required: true }
  }],
  customSubProducts: [{
    originalId: { type: String, required: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    stockQuantity: Number
  }],
  featured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes
ResellerProductSchema.index({ resellerId: 1, productId: 1 }, { unique: true });
ResellerProductSchema.index({ resellerId: 1, enabled: 1 });
ResellerProductSchema.index({ resellerId: 1, featured: 1 });

export const ResellerProduct = mongoose.models.ResellerProduct || 
  mongoose.model<IResellerProduct>('ResellerProduct', ResellerProductSchema);