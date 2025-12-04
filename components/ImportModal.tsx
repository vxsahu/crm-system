'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Product, ProductStatus, BillingStatus } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: Omit<Product, 'id'>[]) => Promise<void>;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Omit<Product, 'id'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
      handleFile(droppedFile);
    } else {
      setError('Please upload a valid Excel or CSV file (.xlsx, .xls, .csv)');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setError(null);
    setIsProcessing(true);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parsedProducts: Omit<Product, 'id'>[] = jsonData.map((row: unknown) => {
        const r = row as Record<string, unknown>;
        // Detect Format (Legacy vs Export)
        const isExportFormat = 'Tag Number' in r;

        // Mapping Logic
        let tagNumber, productName, serialNumber, category, specifications, status, billingStatus, purchasePrice, invoiceNumber, remark, dateRaw, sellInvoiceNumber;

        if (isExportFormat) {
          tagNumber = String(r['Tag Number'] || '');
          productName = String(r['Product Name'] || '');
          dateRaw = r['Purchase Date'];
          serialNumber = String(r['Serial No'] || 'N/A');
          status = r['Status'] as ProductStatus;
          billingStatus = r['Billing'] as BillingStatus;
          invoiceNumber = r['Invoice No'] !== 'N/A' ? String(r['Invoice No']) : '';
          purchasePrice = Number(r['Price']) || 0;
          sellInvoiceNumber = r['Sell Invoice No'] || '';
          remark = r['Remark'] || '';
          
          // Infer category/specs if possible or set defaults
          category = 'Other'; // Export format doesn't have separate category column currently? 
          // Wait, export DOES NOT have category/specs columns in the current implementation!
          // I need to add them to export or infer them. 
          // For now, let's keep them empty or generic if missing.
          specifications = ''; 
        } else {
          // Legacy Format
          tagNumber = String(r['Tag No.'] || '');
          productName = `${r['Brand'] || ''} ${r['Model -No.'] || ''}`.trim();
          dateRaw = r['Date'];
          serialNumber = String(r['Serial-No.'] || 'N/A');
          
          const statusRaw = r['Status'];
          status = statusRaw === 'Sale' ? ProductStatus.SOLD : ProductStatus.IN_STOCK;
          
          const billingRaw = r['Invoice No.'];
          billingStatus = billingRaw === 'Billing Pending' ? BillingStatus.UNBILLED : BillingStatus.BILLED;
          
          invoiceNumber = billingRaw !== 'Billing Pending' ? String(billingRaw) : '';
          purchasePrice = Number(r['Tax Inculding Amount']) || 0;
          remark = `Imported from sheet. Gate Pass: ${r['Gate Pass No'] || 'N/A'}`;

          // Construct specifications
          const specsParts = [];
          if (r['Cpu']) specsParts.push(`CPU: ${r['Cpu']}`);
          if (r['Ram']) specsParts.push(`RAM: ${r['Ram']}`);
          if (r['HDD']) specsParts.push(`Storage: ${r['HDD']}`);
          specifications = specsParts.join(' | ') || r['Model -No.'] || '';

          // Map Category
          category = (r['Product'] as string) || 'Other';
          if (category === 'TFT') category = 'Monitor';
          if (category === 'Phone') category = 'Mobile';
        }

        // Handle Date Parsing
        let purchaseDate = new Date().toISOString().split('T')[0];
        if (dateRaw) {
          if (typeof dateRaw === 'number') {
            // Handle Excel Serial Date
            const date = new Date((dateRaw - (25567 + 2)) * 86400 * 1000);
            purchaseDate = date.toISOString().split('T')[0];
          } else {
            // Handle String Date
            purchaseDate = String(dateRaw);
          }
        }

        return {
          tagNumber,
          productName,
          purchaseDate,
          serialNumber,
          category,
          specifications: String(specifications),
          status: status as ProductStatus,
          billingStatus: billingStatus as BillingStatus,
          purchasePrice,
          invoiceNumber,
          sellInvoiceNumber: String(sellInvoiceNumber || ''),
          remark: String(remark)
        };
      });

      setPreviewData(parsedProducts);
    } catch (err) {
      console.error(err);
      setError('Failed to parse file. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setError(null); // Clear previous errors
    try {
      await onImport(previewData);
      onClose();
      // Reset state
      setFile(null);
      setPreviewData([]);
    } catch (err) {
      console.error('Import error:', err);
      // Display specific error details if available
      const errorMessage = err instanceof Error ? err.message : 'Failed to import products.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-brand-600" />
            Import Products
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Click to upload or drag and drop</h3>
              <p className="text-sm text-slate-500">Excel or CSV files (.xlsx, .xls, .csv)</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); setPreviewData([]); }}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isProcessing ? (
                <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing file...</span>
                </div>
              ) : previewData.length > 0 ? (
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Ready to Import</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Successfully parsed <strong>{previewData.length}</strong> products.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Import Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!previewData.length || isProcessing}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import {previewData.length > 0 ? `${previewData.length} Items` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
