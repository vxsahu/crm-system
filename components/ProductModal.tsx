'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductStatus, BillingStatus } from '../types';
import { X, Save, Loader2 } from 'lucide-react';
import { TechSpecsSection } from './product-modal/TechSpecsSection';
import { BasicInfoSection } from './product-modal/BasicInfoSection';
import { FinancialSection } from './product-modal/FinancialSection';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product | Omit<Product, 'id'>) => Promise<void>;
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
const GENERATION_OPTIONS = [
  '14th Gen', '13th Gen', '12th Gen', '11th Gen', '10th Gen', '9th Gen', '8th Gen', '7th Gen', '6th Gen', '5th Gen', '4th Gen', '3rd Gen', '2nd Gen', '1st Gen',
  'M1', 'M2', 'M3', 'M4',
  'Ryzen 7000', 'Ryzen 5000', 'Ryzen 3000'
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
    gateNumber: '',
    purchasePrice: undefined, 
    soldDate: '',
    soldPrice: undefined,
    sellInvoiceNumber: '',
    remark: ''
  });

  const [techSpecs, setTechSpecs] = useState({
    ram: '',
    processor: '',
    storage: '',
    color: '',
    generation: '',
    custom: ''
  });

  const isTechCategory = ['Laptop', 'Desktop', 'Mobile', 'Tablet'].includes(formData.category || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        invoiceNumber: initialData.invoiceNumber || '',
        gateNumber: initialData.gateNumber || '',
        soldDate: initialData.soldDate || '',
        soldPrice: initialData.soldPrice,
        sellInvoiceNumber: initialData.sellInvoiceNumber || '',
        remark: initialData.remark || ''
      });
      
      // Parse specifications if possible
      if (initialData.specifications) {
         const specs = initialData.specifications;
         const foundRam = RAM_OPTIONS.find(r => specs.includes(r)) || '';
         const foundStorage = STORAGE_OPTIONS.find(s => specs.includes(s)) || '';
         const foundProc = PROCESSOR_OPTIONS.find(p => specs.includes(p)) || '';
         const foundColor = COLOR_OPTIONS.find(c => specs.includes(c)) || '';
         const foundGen = GENERATION_OPTIONS.find(g => specs.includes(g)) || '';
         
         // Extract custom specs by removing known parts
         let customSpec = specs;
         [foundRam, foundStorage, foundProc, foundColor, foundGen].forEach(part => {
           if (part) customSpec = customSpec.replace(part, '');
         });
         // Clean up separators and extra spaces
         customSpec = customSpec.replace(/\|\s*\|/g, '|').replace(/^\|\s*/, '').replace(/\s*\|$/, '').replace(/\s+\|\s+/g, ' | ').trim();
         
         setTechSpecs({ 
             ram: foundRam, 
             storage: foundStorage, 
             processor: foundProc, 
             color: foundColor,
             generation: foundGen,
             custom: customSpec
         });
      } else {
        setTechSpecs({ ram: '', processor: '', storage: '', color: '', generation: '', custom: '' });
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
        gateNumber: '',
        purchasePrice: undefined, // Ensure it resets to undefined (empty input)
        soldDate: '',
        soldPrice: undefined,
        sellInvoiceNumber: '',
        remark: ''
      });
      setTechSpecs({ ram: '', processor: '', storage: '', color: '', generation: '', custom: '' });
    }
  }, [initialData, isOpen]);

  // Sync techSpecs to formData.specifications
  useEffect(() => {
    if (isTechCategory && isOpen) {
        const parts = [
          techSpecs.processor, 
          techSpecs.generation, 
          techSpecs.ram, 
          techSpecs.storage, 
          techSpecs.color,
          techSpecs.custom
        ].filter(Boolean);
        if (parts.length > 0) {
            setFormData(prev => ({ ...prev, specifications: parts.join(' | ') }));
        } else {
            setFormData(prev => ({ ...prev, specifications: '' }));
        }
    }
  }, [techSpecs, isTechCategory, isOpen]);


  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTechSpecChange = (field: keyof typeof techSpecs, value: string) => {
    setTechSpecs(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Ensure purchasePrice is a number before saving
      const submissionData = {
          ...formData,
          purchasePrice: formData.purchasePrice || 0
      };
      await onSave(submissionData as Product);
      onClose();
    } catch (error) {
      console.error("Failed to save product", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <BasicInfoSection formData={formData} handleChange={handleChange} />
            </div>

            {/* Tech Specs Section */}
            <TechSpecsSection 
                techSpecs={techSpecs} 
                handleTechSpecChange={handleTechSpecChange} 
                isTechCategory={isTechCategory}
                specifications={formData.specifications || ''}
                handleChange={handleChange as (field: string, value: string) => void}
                RAM_OPTIONS={RAM_OPTIONS}
                STORAGE_OPTIONS={STORAGE_OPTIONS}
                PROCESSOR_OPTIONS={PROCESSOR_OPTIONS}
                COLOR_OPTIONS={COLOR_OPTIONS}
                GENERATION_OPTIONS={GENERATION_OPTIONS}
            />

            {/* Financial & Status Section */}
            <FinancialSection formData={formData} handleChange={handleChange} />

            {/* Remarks */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Remarks / Notes</label>
              <textarea
                value={formData.remark || ''}
                onChange={(e) => handleChange('remark', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] min-h-[80px] placeholder:text-slate-400"
                placeholder="Any additional details..."
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-[#369282] hover:bg-[#2d7a6d] rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};