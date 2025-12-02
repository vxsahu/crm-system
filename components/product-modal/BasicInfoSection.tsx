import React from 'react';
import { Product } from '@/types';

interface BasicInfoSectionProps {
  formData: Partial<Product>;
  handleChange: (field: keyof Product, value: any) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, handleChange }) => {
  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Tag Number</label>
        <input
          type="text"
          value={formData.tagNumber}
          onChange={(e) => handleChange('tagNumber', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400"
          placeholder="e.g. TAG-1001"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Product Name</label>
        <input
          type="text"
          value={formData.productName}
          onChange={(e) => handleChange('productName', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400"
          placeholder="e.g. MacBook Pro"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Category</label>
        <select
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] bg-white"
        >
          <option value="Laptop">Laptop</option>
          <option value="Desktop">Desktop</option>
          <option value="Monitor">Monitor</option>
          <option value="Mobile">Mobile</option>
          <option value="Tablet">Tablet</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Gate Number</label>
        <input
          type="text"
          value={formData.gateNumber || ''}
          onChange={(e) => handleChange('gateNumber', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400"
          placeholder="e.g. G-12"
        />
      </div>
    </>
  );
};
