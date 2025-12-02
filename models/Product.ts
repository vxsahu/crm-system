import mongoose, { Schema, Document, Model } from 'mongoose';
import { ProductStatus, BillingStatus } from '@/types';

export interface IProduct extends Document {
  tagNumber: string;
  purchaseDate: string;
  serialNumber: string;
  productName: string;
  category: string;
  specifications: string;
  status: ProductStatus;
  billingStatus: BillingStatus;
  invoiceNumber?: string;
  purchasePrice: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    tagNumber: { type: String, required: true, unique: true },
    purchaseDate: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    specifications: { type: String, default: '' },
    status: { 
      type: String, 
      enum: Object.values(ProductStatus), 
      default: ProductStatus.IN_STOCK 
    },
    billingStatus: { 
      type: String, 
      enum: Object.values(BillingStatus), 
      default: BillingStatus.UNBILLED 
    },
    invoiceNumber: { type: String },
    purchasePrice: { type: Number, required: true },
    remark: { type: String },
  },
  {
    timestamps: true,
  }
);

// Check if model is already compiled to avoid OverwriteModelError
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
