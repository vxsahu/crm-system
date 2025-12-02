import React from 'react';
import { Product, ProductStatus, BillingStatus } from '@/types';
import { CheckCircle, AlertCircle, Edit2, Trash2, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface InventoryTableProps {
  filteredProducts: Product[];
  selectedProducts: string[];
  handleSelectAll: () => void;
  handleSelectProduct: (id: string) => void;
  handleEditProduct: (product: Product) => void;
  handleDeleteProduct: (id: string) => void;
  isFiltered: boolean;
  clearFilters: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  filteredProducts,
  selectedProducts,
  handleSelectAll,
  handleSelectProduct,
  handleEditProduct,
  handleDeleteProduct,
  isFiltered,
  clearFilters
}) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer translate-y-0.5"
                />
              </TableHead>
              <TableHead>Tag #</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Purchase Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="group">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer translate-y-0.5"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.tagNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{product.productName}</span>
                      <span className="text-xs text-slate-500 truncate max-w-[200px]">{product.specifications}</span>
                      <span className="text-xs text-slate-400">SN: {product.serialNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{product.purchaseDate}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${product.status === ProductStatus.IN_STOCK ? 'bg-brand-50 text-brand-700 border-brand-100' : ''}
                        ${product.status === ProductStatus.SOLD ? 'bg-green-50 text-green-700 border-green-100' : ''}
                        ${product.status === ProductStatus.RETURNED ? 'bg-danger-50 text-danger-700 border-danger-100' : ''}
                      `}
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.billingStatus === BillingStatus.BILLED ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">Billed</span>
                          <span className="text-[10px] text-slate-400">{product.invoiceNumber}</span>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-accent-50 text-accent-700 border-accent-100">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Unbilled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700">
                    ₹{product.purchasePrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-md transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <Search className="w-12 h-12 text-slate-200 mb-3" />
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
                    {isFiltered && (
                      <button onClick={clearFilters} className="mt-3 text-brand-600 hover:underline">Clear Filters</button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
