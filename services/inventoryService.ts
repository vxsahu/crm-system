import { Product } from '../types';

const API_URL = '/api/products';

export const inventoryService = {
  async getAll(): Promise<Product[]> {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', res.status, errorText);
      throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },

  async add(product: Omit<Product, 'id'>): Promise<Product> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Failed to add product:', errorData);
      throw new Error(errorData.details || 'Failed to add product');
    }
    return res.json();
  },

  async update(product: Product): Promise<Product> {
    const res = await fetch(`${API_URL}/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Failed to update product:', errorData);
      throw new Error(errorData.error || 'Failed to update product');
    }
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  async importCSV(products: Omit<Product, 'id'>[]): Promise<Product[]> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Failed to import products:', errorData);
      throw new Error(errorData.details || 'Failed to import products');
    }
    return res.json();
  }
};
