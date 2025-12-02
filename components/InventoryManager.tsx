'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductStatus, BillingStatus } from '../types';
import { Search, Filter, Download, Edit2, CheckCircle, AlertCircle, Trash2, Plus, X, ArrowLeft } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductModal } from './ProductModal';
import { ImportModal } from './ImportModal';
import { ConfirmModal } from './ConfirmModal';

interface InventoryManagerProps {
  initialFilters?: { status: string; billing: string } | null;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ initialFilters }) => {
  const { products, addProduct, addProducts, updateProduct, deleteProduct, deleteProducts, updateProductsStatus } = useInventory();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBilling, setFilterBilling] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Bulk Selection State
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'bulk'>('single');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // React to URL search params
  useEffect(() => {
    const status = searchParams.get('status');
    const billing = searchParams.get('billing');
    if (status) setFilterStatus(status);
    if (billing) setFilterBilling(billing);
  }, [searchParams]);

  // React to prop changes (legacy support or if passed from parent)
  useEffect(() => {
    if (initialFilters) {
      setFilterStatus(initialFilters.status);
      setFilterBilling(initialFilters.billing);
    }
  }, [initialFilters]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'ALL' || product.status === filterStatus;
      const matchesBilling = filterBilling === 'ALL' || product.billingStatus === filterBilling;

      return matchesSearch && matchesStatus && matchesBilling;
    });
  }, [products, searchTerm, filterStatus, filterBilling]);

  const handleExport = () => {
    // Generate CSV
    const headers = ['Tag Number', 'Product Name', 'Category', 'Specifications', 'Purchase Date', 'Serial No', 'Status', 'Billing', 'Invoice No', 'Price', 'Remark'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(p => [
        p.tagNumber,
        `"${p.productName.replace(/"/g, '""')}"`, // Escape quotes
        `"${p.category.replace(/"/g, '""')}"`,
        `"${p.specifications.replace(/"/g, '""')}"`,
        p.purchaseDate,
        p.serialNumber,
        p.status,
        p.billingStatus,
        p.invoiceNumber || 'N/A',
        p.purchasePrice,
        `"${(p.remark || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUnbilledFilter = () => {
    setFilterBilling(BillingStatus.UNBILLED);
    setFilterStatus('ALL');
  };

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterBilling('ALL');
    setSearchTerm('');
    router.push('/inventory'); // Clear URL params
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData: Product | Omit<Product, 'id'>) => {
    if ('id' in productData && productData.id) {
      await updateProduct(productData as Product);
    } else {
      await addProduct(productData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
    setDeleteTarget('single');
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    setDeleteTarget('bulk');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget === 'single' && productToDelete) {
        await deleteProduct(productToDelete);
      } else if (deleteTarget === 'bulk') {
        await deleteProducts(selectedProducts);
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete product(s). Please try again.');
    }
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (!status || selectedProducts.length === 0) return;

    try {
      await updateProductsStatus(selectedProducts, status);
      setSelectedProducts([]);
    } catch (error) {
      console.error('Status update failed:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  const isFiltered = filterStatus !== 'ALL' || filterBilling !== 'ALL' || searchTerm !== '';

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-85px)] lg:h-[calc(100vh-140px)]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4 bg-white rounded-t-xl">

          {/* Mobile/Header Row with Back Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600 rounded-full transition-colors group"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">Inventory Management</h2>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Tag, Serial, Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 cursor-pointer min-w-[120px]"
                >
                  <option value="ALL">All Status</option>
                  {Object.values(ProductStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                  value={filterBilling}
                  onChange={(e) => setFilterBilling(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 cursor-pointer min-w-[120px]"
                >
                  <option value="ALL">All Billing</option>
                  {Object.values(BillingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {isFiltered && (
                <button
                  onClick={clearFilters}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg sm:rounded-full self-end sm:self-center"
                  title="Clear all filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions Section - Scrollable on very small screens */}
            <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0 justify-start xl:justify-end no-scrollbar">
              <button
                onClick={handleUnbilledFilter}
                className="whitespace-nowrap px-3 py-2 bg-accent-50 text-accent-700 border border-accent-200 rounded-lg text-sm font-medium hover:bg-accent-100 transition-colors flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Unbilled</span>
              </button>

              <button
                onClick={handleExport}
                className="whitespace-nowrap px-3 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="whitespace-nowrap px-3 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4 rotate-180" />
                <span className="hidden sm:inline">Import</span>
              </button>

              <button
                onClick={handleAddProduct}
                className="whitespace-nowrap px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Toolbar - Shows when products are selected */}
        {selectedProducts.length > 0 && (
          <div className="px-4 py-3 bg-brand-50 border-b border-brand-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-900">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-xs text-brand-600 hover:text-brand-700 underline"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusUpdate(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 border border-brand-300 rounded-lg text-sm bg-white text-slate-700 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Update Status...</option>
                {Object.values(ProductStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 w-12 border-b border-slate-200">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Tag #</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Product</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Purchase Info</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Billing</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Price</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {product.tagNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-800">{product.productName}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{product.specifications}</span>
                        <span className="text-xs text-slate-400">SN: {product.serialNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {product.purchaseDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${product.status === ProductStatus.IN_STOCK ? 'bg-brand-50 text-brand-700 border-brand-100' : ''}
                        ${product.status === ProductStatus.SOLD ? 'bg-green-50 text-green-700 border-green-100' : ''}
                        ${product.status === ProductStatus.RETURNED ? 'bg-danger-50 text-danger-700 border-danger-100' : ''}
                      `}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.billingStatus === BillingStatus.BILLED ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium">Billed</span>
                              <span className="text-[10px] text-slate-400">{product.invoiceNumber}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-accent-600 bg-accent-50 px-2 py-1 rounded-md border border-accent-100">
                            <AlertCircle className="w-4 h-4 mr-1.5" />
                            <span className="text-xs font-medium">Unbilled</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                      ₹{product.purchasePrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-12 h-12 text-slate-200 mb-3" />
                      <p className="text-lg font-medium text-slate-500">No products found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                      {isFiltered && (
                        <button onClick={clearFilters} className="mt-3 text-brand-600 hover:underline">Clear Filters</button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between rounded-b-xl">
          <span>Showing {filteredProducts.length} entries</span>
          <span>Data entry active (Rohit)</span>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={addProducts}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={deleteTarget === 'bulk' ? 'Delete Multiple Products' : 'Delete Product'}
        message={
          deleteTarget === 'bulk'
            ? `Are you sure you want to delete ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}? This action cannot be undone.`
            : 'Are you sure you want to delete this product? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};