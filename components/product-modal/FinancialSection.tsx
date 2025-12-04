import React from 'react';
import { Product, ProductStatus, BillingStatus } from '@/types';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface FinancialSectionProps {
  formData: Partial<Product>;
  handleChange: (field: keyof Product, value: any) => void;
}

export const FinancialSection: React.FC<FinancialSectionProps> = ({ formData, handleChange }) => {
  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Purchase Date</label>
        <input
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => handleChange('purchaseDate', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282]"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Serial Number</label>
        <input
          type="text"
          value={formData.serialNumber}
          onChange={(e) => handleChange('serialNumber', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400"
          placeholder="e.g. SN12345678"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Purchase Price (₹)</label>
        <input
          type="number"
          min="0"
          value={formData.purchasePrice ?? ''}
          onChange={(e) => handleChange('purchasePrice', e.target.value === '' ? undefined : parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400"
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Current Status</label>
        <select
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] bg-white"
        >
          {Object.values(ProductStatus).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {formData.status === ProductStatus.SOLD && (
        <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Sold Date</label>
            <input
              type="date"
              value={formData.soldDate || ''}
              onChange={(e) => handleChange('soldDate', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Sold Price (₹)</label>
            <input
              type="number"
              min="0"
              value={formData.soldPrice ?? ''}
              onChange={(e) => handleChange('soldPrice', e.target.value === '' ? undefined : parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400"
              placeholder="0"
            />
          </div>
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Sell Invoice Number <span className="text-slate-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              value={formData.sellInvoiceNumber || ''}
              onChange={(e) => handleChange('sellInvoiceNumber', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400"
              placeholder="e.g. INV-SALE-001"
            />
          </div>
        </div>
      )}

      {/* Billing Info Section */}
      <div className="md:col-span-2 mt-2 pt-4">
         <h3 className="text-sm font-semibold text-[#369282] mb-4 uppercase tracking-wide">Financials & Billing</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Billing Status</label>
              <div className="flex gap-3">
                  <button
                      type="button"
                      onClick={() => handleChange('billingStatus', BillingStatus.BILLED)}
                      className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                          formData.billingStatus === BillingStatus.BILLED
                              ? 'bg-white border-[#369282] text-[#369282] ring-1 ring-[#369282]'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                      <CheckCircle className="w-4 h-4" />
                      Billed
                  </button>
                  <button
                      type="button"
                      onClick={() => handleChange('billingStatus', BillingStatus.UNBILLED)}
                      className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                          formData.billingStatus === BillingStatus.UNBILLED
                              ? 'bg-white border-orange-500 text-orange-500 ring-1 ring-orange-500'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                      <AlertCircle className="w-4 h-4" />
                      Unbilled
                  </button>
              </div>
            </div>

            {formData.billingStatus === BillingStatus.BILLED && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-slate-700">Invoice Number</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400"
                  placeholder="e.g. INV-2023-001"
                />
              </div>
            )}
         </div>
      </div>
    </>
  );
};
