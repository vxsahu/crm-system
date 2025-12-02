'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductStatus, BillingStatus } from '../types';
import { Trash2, ArrowLeft } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ImportModal } from './ImportModal';
import { ConfirmModal } from './ConfirmModal';
import { InventoryFilters } from './inventory/InventoryFilters';
import { InventoryActions } from './inventory/InventoryActions';
import { InventoryTable } from './inventory/InventoryTable';
import { ProductModal } from './ProductModal';

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
    // Use server-side streaming export with filters
    const params = new URLSearchParams();
    if (filterStatus !== 'ALL') params.append('status', filterStatus);
    if (filterBilling !== 'ALL') params.append('billing', filterBilling);
    if (searchTerm) params.append('search', searchTerm);
    
    window.location.href = `/api/products/export?${params.toString()}`;
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
      <div className="flex flex-col h-[calc(100vh-85px)] lg:h-[calc(100vh-140px)]">
        {/* Toolbar */}
        <div className="pb-6 border-b border-slate-100 flex flex-col gap-6">

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Inventory Management</h2>
                <p className="text-sm text-slate-500">Manage your products, stock, and billing.</p>
              </div>
            </div>
            
            {/* Actions moved to top row on desktop for better access */}
            <div className="hidden lg:block">
              <InventoryActions
                handleExport={handleExport}
                setIsImportModalOpen={setIsImportModalOpen}
                handleAddProduct={handleAddProduct}
                handleUnbilledFilter={handleUnbilledFilter}
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <InventoryFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterBilling={filterBilling}
              setFilterBilling={setFilterBilling}
              isFiltered={isFiltered}
              clearFilters={clearFilters}
              handleUnbilledFilter={handleUnbilledFilter}
            />

            {/* Actions shown here on mobile/tablet */}
            <div className="lg:hidden w-full">
              <InventoryActions
                handleExport={handleExport}
                setIsImportModalOpen={setIsImportModalOpen}
                handleAddProduct={handleAddProduct}
                handleUnbilledFilter={handleUnbilledFilter}
              />
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

        <InventoryTable
          filteredProducts={filteredProducts}
          selectedProducts={selectedProducts}
          handleSelectAll={handleSelectAll}
          handleSelectProduct={handleSelectProduct}
          handleEditProduct={handleEditProduct}
          handleDeleteProduct={handleDeleteProduct}
          isFiltered={isFiltered}
          clearFilters={clearFilters}
        />
        
        <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
          <span>Showing {filteredProducts.length} entries</span>
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