'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Product, ProductStatus, BillingStatus } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  initialData?: Product;
}

const RAM_OPTIONS = ['4GB', '8GB', '12GB', '16GB', '24GB', '32GB', '64GB', '128GB'];
const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB', '8TB'];
const PROCESSOR_OPTIONS = [
  'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4',
  'Apple M1 Pro', 'Apple M2 Pro', 'Apple M3 Pro', 
  'Apple M1 Max', 'Apple M2 Max', 'Apple M3 Max',
  'Intel i3', 'Intel i5', 'Intel i7', 'Intel i9', 'Intel Core Ultra',
  'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9',
  'Snapdragon X Elite'
];
const COLOR_OPTIONS = [
  'Space Grey', 'Silver', 'Gold', 'Midnight', 'Starlight', 
  'Black', 'White', 'Blue', 'Red', 'Green', 
  'Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium',
  'Graphite', 'Sierra Blue', 'Deep Purple'
];

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  // Initialize with undefined for purchasePrice to show empty input instead of 0
  const [formData, setFormData] = useState<Partial<Product>>({
    tagNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    serialNumber: '',
    productName: '',
    category: 'Laptop',
    specifications: '',
    status: ProductStatus.IN_STOCK,
    billingStatus: BillingStatus.UNBILLED,
    invoiceNumber: '',
    purchasePrice: undefined, 
    remark: ''
  });

  const [techSpecs, setTechSpecs] = useState({
    ram: '',
    processor: '',
    storage: '',
    color: ''
  });

  const isTechCategory = ['Laptop', 'Desktop', 'Mobile', 'Tablet'].includes(formData.category || '');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        invoiceNumber: initialData.invoiceNumber || '',
        remark: initialData.remark || ''
      });
      
      // Attempt to parse existing specs for tech categories
      if (['Laptop', 'Desktop', 'Mobile', 'Tablet'].includes(initialData.category)) {
         const specs = initialData.specifications || '';
         const foundRam = RAM_OPTIONS.find(r => specs.includes(r)) || '';
         const foundStorage = STORAGE_OPTIONS.find(s => specs.includes(s)) || '';
         const foundProc = PROCESSOR_OPTIONS.find(p => specs.includes(p)) || '';
         const foundColor = COLOR_OPTIONS.find(c => specs.includes(c)) || '';
         
         // Only set if we found something, otherwise keep defaults or empty
         setTechSpecs({ 
             ram: foundRam, 
             storage: foundStorage, 
             processor: foundProc, 
             color: foundColor 
         });
      }
    } else {
      setFormData({
        tagNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        serialNumber: '',
        productName: '',
        category: 'Laptop',
        specifications: '',
        status: ProductStatus.IN_STOCK,
        billingStatus: BillingStatus.UNBILLED,
        invoiceNumber: '',
        purchasePrice: undefined, // Ensure it resets to undefined (empty input)
        remark: ''
      });
      setTechSpecs({ ram: '', processor: '', storage: '', color: '' });
    }
  }, [initialData, isOpen]);

  // Sync techSpecs to formData.specifications
  useEffect(() => {
    if (isTechCategory && isOpen) {
        const parts = [techSpecs.processor, techSpecs.ram, techSpecs.storage, techSpecs.color].filter(Boolean);
        if (parts.length > 0) {
            setFormData(prev => ({ ...prev, specifications: parts.join(' | ') }));
        }
    }
  }, [techSpecs, isTechCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure purchasePrice is a number before saving
    const submissionData = {
        ...formData,
        purchasePrice: formData.purchasePrice || 0
    };
    onSave(submissionData as Product);
    onClose();
  };

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTechSpecChange = (field: keyof typeof techSpecs, value: string) => {
      setTechSpecs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Product' : 'New Purchase Entry'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Info Section */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-brand-600 mb-3 uppercase tracking-wide">Product Details</h3>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Tag Number <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                value={formData.tagNumber}
                onChange={(e) => handleChange('tagNumber', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                placeholder="e.g. TAG-001"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Mobile">Mobile</option>
                <option value="Tablet">Tablet</option>
                <option value="TV">TV</option>
                <option value="Monitor">Monitor</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Product Name <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                value={formData.productName}
                onChange={(e) => handleChange('productName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="e.g. MacBook Pro 14"
              />
            </div>

             <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                {isTechCategory ? 'Technical Specifications' : 'Product Description / Specs'}
              </label>
              
              {isTechCategory ? (
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                    
                    {/* Processor */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Processor</label>
                        <select 
                            value={techSpecs.processor}
                            onChange={(e) => handleTechSpecChange('processor', e.target.value)}
                            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 bg-white"
                        >
                            <option value="">Select Processor</option>
                            {PROCESSOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    {/* RAM Chips */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">RAM</label>
                        <div className="flex flex-wrap gap-2">
                            {RAM_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleTechSpecChange('ram', opt === techSpecs.ram ? '' : opt)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                                        techSpecs.ram === opt 
                                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                                            : 'bg-white text-slate-600 border-slate-300 hover:border-brand-400 hover:text-brand-600'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Storage Chips */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Storage</label>
                        <div className="flex flex-wrap gap-2">
                             {STORAGE_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleTechSpecChange('storage', opt === techSpecs.storage ? '' : opt)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                                        techSpecs.storage === opt 
                                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                                            : 'bg-white text-slate-600 border-slate-300 hover:border-brand-400 hover:text-brand-600'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                     {/* Color */}
                     <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Color</label>
                        <select 
                            value={techSpecs.color}
                            onChange={(e) => handleTechSpecChange('color', e.target.value)}
                            className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 bg-white"
                        >
                            <option value="">Select Color</option>
                            {COLOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Preview:</span>
                             <span className="text-xs font-medium text-slate-700">{formData.specifications || 'No specs selected'}</span>
                        </div>
                    </div>
                 </div>
              ) : (
                <input
                    type="text"
                    value={formData.specifications}
                    onChange={(e) => handleChange('specifications', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="e.g. Dimensions, Weight, Material"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Serial Number"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Current Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {Object.values(ProductStatus).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Billing Info Section */}
            <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-100">
               <h3 className="text-sm font-semibold text-brand-600 mb-3 uppercase tracking-wide">Financials & Billing</h3>
            </div>

             <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Purchase Date</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Purchase Price (₹) <span className="text-red-500">*</span></label>
              <input
                required
                type="number"
                min="0"
                value={formData.purchasePrice ?? ''}
                onChange={(e) => handleChange('purchasePrice', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                onFocus={(e) => e.target.select()}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Billing Status</label>
              <div className="flex space-x-4 mt-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio text-brand-600"
                    name="billingStatus"
                    value={BillingStatus.UNBILLED}
                    checked={formData.billingStatus === BillingStatus.UNBILLED}
                    onChange={() => handleChange('billingStatus', BillingStatus.UNBILLED)}
                  />
                  <span className="ml-2 text-red-600 font-medium">Unbilled</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio text-brand-600"
                    name="billingStatus"
                    value={BillingStatus.BILLED}
                    checked={formData.billingStatus === BillingStatus.BILLED}
                    onChange={() => handleChange('billingStatus', BillingStatus.BILLED)}
                  />
                  <span className="ml-2 text-green-600 font-medium">Billed</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Invoice Number</label>
              <input
                type="text"
                disabled={formData.billingStatus === BillingStatus.UNBILLED}
                value={formData.invoiceNumber || ''}
                onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${formData.billingStatus === BillingStatus.UNBILLED ? 'bg-slate-100 text-slate-400' : ''}`}
                placeholder={formData.billingStatus === BillingStatus.UNBILLED ? "N/A" : "INV-XXXX"}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-slate-700">Remark / Notes</label>
              <textarea
                value={formData.remark || ''}
                onChange={(e) => handleChange('remark', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                rows={2}
                placeholder="Any specific details, return reasons, or vendor communication notes."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Details
          </button>
        </div>
      </div>
    </div>
  );
};