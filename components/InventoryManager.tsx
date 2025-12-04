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

/**
 * InventoryManager — Minimalist (Option B)
 * - text-base for headings, text-sm for all other text
 * - grayscale foundation tokens + functional color accents
 * - conservative interactions and clear affordances
 */

interface InventoryManagerProps {
  initialFilters?: { status: string; billing: string } | null;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ initialFilters }) => {
  const { products, addProduct, addProducts, updateProduct, deleteProduct, deleteProducts, updateProductsStatus } = useInventory();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters / UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBilling, setFilterBilling] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');

  // Modals & editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Selection
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'bulk'>('single');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // sync URL params
  useEffect(() => {
    const status = searchParams.get('status');
    const billing = searchParams.get('billing');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (status && status !== filterStatus) setFilterStatus(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (billing && billing !== filterBilling) setFilterBilling(billing);
  }, [searchParams, filterStatus, filterBilling]);

  useEffect(() => {
    if (initialFilters) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (initialFilters.status !== filterStatus) setFilterStatus(initialFilters.status);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (initialFilters.billing !== filterBilling) setFilterBilling(initialFilters.billing);
    }
  }, [initialFilters, filterStatus, filterBilling]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        product.tagNumber.toLowerCase().includes(q) ||
        product.productName.toLowerCase().includes(q) ||
        product.serialNumber.toLowerCase().includes(q);

      const matchesStatus = filterStatus === 'ALL' || product.status === filterStatus;
      const matchesBilling = filterBilling === 'ALL' || product.billingStatus === filterBilling;

      let matchesDate = true;
      if (filterMonth !== 'ALL' || filterYear !== 'ALL') {
        const date = new Date(product.purchaseDate);
        const month = date.getMonth().toString(); // 0-11
        const year = date.getFullYear().toString();

        if (filterMonth !== 'ALL' && month !== filterMonth) matchesDate = false;
        if (filterYear !== 'ALL' && year !== filterYear) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesBilling && matchesDate;
    });
  }, [products, searchTerm, filterStatus, filterBilling, filterMonth, filterYear]);

  // Exports use server-side streaming endpoint with current filters
  const handleExport = () => {
    const params = new URLSearchParams();
    if (filterStatus !== 'ALL') params.append('status', filterStatus);
    if (filterBilling !== 'ALL') params.append('billing', filterBilling);
    if (searchTerm) params.append('search', searchTerm.trim());
    window.location.href = `/api/products/export?${params.toString()}`;
  };

  const handleUnbilledFilter = () => {
    setFilterBilling(BillingStatus.UNBILLED);
    setFilterStatus('ALL');
  };

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterBilling('ALL');
    setFilterMonth('ALL');
    setFilterYear('ALL');
    setSearchTerm('');
    // reset URL params with router
    router.push('/inventory');
  };

  // CRUD
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
      // keep messaging simple and neutral
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

  const isFiltered = filterStatus !== 'ALL' || filterBilling !== 'ALL' || searchTerm !== '' || filterMonth !== 'ALL' || filterYear !== 'ALL';

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-85px)] lg:h-[calc(100vh-140px)]">
        {/* Toolbar (grayscale card with small accent on primary action) */}
        <div className="pb-6 border-b border-border/60 bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 -ml-2 text-muted-foreground hover:bg-muted/20 rounded-full transition-colors text-sm"
                title="Back to Dashboard"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>

              <div>
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  Inventory Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage products, stock and billing
                </p>
              </div>
            </div>

            {/* Desktop actions (primary accent used only for primary CTA) */}
            <div className="hidden lg:flex items-center gap-3">
              <InventoryActions
                handleExport={handleExport}
                setIsImportModalOpen={setIsImportModalOpen}
                handleAddProduct={handleAddProduct}
              />
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center px-4 lg:px-8 pb-4">
            <InventoryFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterBilling={filterBilling}
              setFilterBilling={setFilterBilling}
              filterMonth={filterMonth}
              setFilterMonth={setFilterMonth}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
              isFiltered={isFiltered}
              clearFilters={clearFilters}
              handleUnbilledFilter={handleUnbilledFilter}
            />

            {/* Mobile actions */}
            <div className="lg:hidden w-full">
              <InventoryActions
                handleExport={handleExport}
                setIsImportModalOpen={setIsImportModalOpen}
                handleAddProduct={handleAddProduct}
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions Toolbar — neutral gray with subtle accent label */}
        {selectedProducts.length > 0 && (
          <div className="px-4 py-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-muted-foreground hover:underline"
                aria-label="Clear selection"
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
                className="flex-1 sm:flex-none px-3 py-2 border border-border rounded-lg text-sm bg-card text-foreground cursor-pointer"
                defaultValue=""
                aria-label="Bulk status update"
              >
                <option value="" disabled>Update status...</option>
                {Object.values(ProductStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-danger text-danger-foreground hover:opacity-95 transition-colors flex items-center gap-2"
                aria-label="Delete selected products"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <InventoryTable
            filteredProducts={filteredProducts}
            selectedProducts={selectedProducts}
            handleSelectAll={handleSelectAll}
            handleSelectProduct={handleSelectProduct}
            handleEditProduct={handleEditProduct}
            handleDeleteProduct={handleDeleteProduct}
            isFiltered={isFiltered}
            clearFilters={clearFilters}
            // Ensure InventoryTable renders with text-sm for rows and text-base for any section headings
          />
        </div>

        <div className="pt-3 border-t border-border text-sm text-muted-foreground flex justify-between px-4 lg:px-8">
          <span>Showing {filteredProducts.length} entries</span>
        </div>
      </div>

      {/* Product modal — neutral, minimal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />

      {/* Import */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={addProducts}
      />

      {/* Confirm modal — destructive action uses danger token */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={deleteTarget === 'bulk' ? 'Delete multiple products' : 'Delete product'}
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
