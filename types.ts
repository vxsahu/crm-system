export enum ProductStatus {
  IN_STOCK = 'In Stock',
  SOLD = 'Sold',
  RETURNED = 'Returned'
}

export enum BillingStatus {
  BILLED = 'Billed',
  UNBILLED = 'Unbilled'
}

export interface Product {
  id: string;
  tagNumber: string;
  purchaseDate: string; // ISO string YYYY-MM-DD
  serialNumber: string;
  productName: string; // e.g., Laptop, TV, etc.
  category: string;
  specifications: string; // CPU, Processor, Mac Model combined or specific field
  remark?: string;
  gateNumber?: string;
  status: ProductStatus;
  billingStatus: BillingStatus;
  invoiceNumber?: string;
  purchasePrice: number;
  soldDate?: string;
  soldPrice?: number;
  sellInvoiceNumber?: string;
}

export interface DashboardStats {
  totalInventory: number;
  totalSold: number;
  totalReturned: number;
  totalUnbilled: number;
  unbilledValue: number;
}
