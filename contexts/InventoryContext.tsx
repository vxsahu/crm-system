'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  products: Product[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  addProducts: (products: Omit<Product, 'id'>[]) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteProducts: (ids: string[]) => Promise<void>;
  updateProductsStatus: (ids: string[], status: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const loadData = async () => {
    // Only load data if user is authenticated
    if (!user) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await inventoryService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load data when auth is ready and user is authenticated
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    await inventoryService.add(product);
    await loadData();
  };

  const addProducts = async (newProducts: Omit<Product, 'id'>[]) => {
    try {
      console.log('Attempting to import products:', newProducts.length);
      console.log('Sample product:', newProducts[0]);

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProducts),
      });

      // Get response body for better error messages
      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        console.error('Import failed:', {
          status: res.status,
          statusText: res.statusText,
          data: responseData
        });

        const errorMessage = responseData?.details || responseData?.error || `Failed to import products (${res.status})`;
        throw new Error(errorMessage);
      }

      console.log('Import successful:', responseData);
      await loadData();
    } catch (error) {
      console.error('addProducts error:', error);
      throw error; // Re-throw to be caught by ImportModal
    }
  };

  const updateProduct = async (product: Product) => {
    await inventoryService.update(product);
    await loadData();
  };

  const deleteProduct = async (id: string) => {
    await inventoryService.delete(id);
    await loadData();
  };

  const deleteProducts = async (ids: string[]) => {
    const res = await fetch('/api/products/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.details || 'Failed to delete products');
    }
    await loadData();
  };

  const updateProductsStatus = async (ids: string[], status: string) => {
    const res = await fetch('/api/products/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.details || 'Failed to update products');
    }
    await loadData();
  };

  return (
    <InventoryContext.Provider value={{
      products,
      isLoading,
      refreshData: loadData,
      addProduct,
      addProducts,
      updateProduct,
      deleteProduct,
      deleteProducts,
      updateProductsStatus
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
