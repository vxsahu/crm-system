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
  gateNumber?: string;
  soldDate?: string;
  soldPrice?: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    tagNumber: { type: String, required: true, unique: true },
    purchaseDate: { type: String, required: true },
    serialNumber: { type: String, required: true }, // Unique constraint handled by partial index below
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
    gateNumber: { type: String },
    soldDate: { type: String },
    soldPrice: { type: Number },
    remark: { type: String },
  },
  {
    timestamps: true,
  }
);

// Partial unique index: enforce uniqueness for serial numbers except 'N/A'
// This allows multiple products with serialNumber = 'N/A'
ProductSchema.index(
  { serialNumber: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { serialNumber: { $ne: 'N/A' } } 
  }
);

// Delete existing model to avoid caching issues during hot-reload
if (process.env.NODE_ENV === 'development' && mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
