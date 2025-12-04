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
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-lg border border-slate-200mx-4 lg:mx-8 mb-4">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60 z-10">
            <TableRow className="hover:bg-transparent border-b border-slate-200">
              <TableHead className="w-10 py-2 pl-4">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                  className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer translate-y-0.5"
                />
              </TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Tag #</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Purchase Date</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Billing</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Price</TableHead>
              <TableHead className="py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right pr-4 w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                  <TableCell className="py-2.5 pl-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="w-3.5 h-3.5 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer translate-y-0.5"
                    />
                  </TableCell>
                  <TableCell className="py-2.5 font-medium text-sm text-slate-700 whitespace-nowrap">{product.tagNumber}</TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm text-slate-900 leading-tight">{product.productName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 truncate max-w-[240px]" title={product.specifications}>
                          {product.specifications}
                        </span>
                        {product.serialNumber && product.serialNumber !== 'N/A' && (
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            SN: {product.serialNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(product.purchaseDate)}
                  </TableCell>
                  <TableCell className="py-2.5 whitespace-nowrap">
                    <Badge 
                      variant="outline" 
                      className={`
                        h-5 px-2 text-[10px] font-medium border
                        ${product.status === ProductStatus.IN_STOCK ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                        ${product.status === ProductStatus.SOLD ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${product.status === ProductStatus.RETURNED ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                      `}
                    >
                      {product.status}
                    </Badge>
                    {product.status === ProductStatus.SOLD && product.sellInvoiceNumber && (
                      <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-slate-100 rounded border border-slate-200 w-fit">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Inv:</span>
                        <span className="text-[11px] font-semibold text-slate-700 font-mono">{product.sellInvoiceNumber}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 whitespace-nowrap">
                    {product.billingStatus === BillingStatus.BILLED ? (
                      <div className="flex items-center text-emerald-600">
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium leading-none">Billed</span>
                          {product.invoiceNumber && (
                            <span className="text-[9px] text-slate-400 mt-0.5">{product.invoiceNumber}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="h-5 px-2 text-[10px] font-medium bg-amber-50 text-amber-700 border-amber-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Unbilled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 font-semibold text-sm text-slate-700 whitespace-nowrap">
                    ₹{product.purchasePrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2.5 text-right pr-4 whitespace-nowrap">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">No products found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters</p>
                    {isFiltered && (
                      <button onClick={clearFilters} className="mt-3 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline">
                        Clear Filters
                      </button>
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
