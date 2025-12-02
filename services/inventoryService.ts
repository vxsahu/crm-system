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
    const CHUNK_SIZE = 500;
    const chunks = [];
    
    // Split into chunks
    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      chunks.push(products.slice(i, i + CHUNK_SIZE));
    }

    const allCreatedProducts: Product[] = [];

    // Process chunks sequentially
    for (const chunk of chunks) {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to import chunk:', errorData);
        throw new Error(errorData.details || 'Failed to import products');
      }

      const createdChunk = await res.json();
      allCreatedProducts.push(...createdChunk);
    }

    return allCreatedProducts;
  },

  async deleteBulk(ids: string[]): Promise<void> {
    const res = await fetch(`${API_URL}/bulk`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.details || 'Failed to delete products');
    }
  },

  async updateStatusBulk(ids: string[], status: string): Promise<void> {
    const res = await fetch(`${API_URL}/bulk`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, status }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.details || 'Failed to update products');
    }
  }
};
