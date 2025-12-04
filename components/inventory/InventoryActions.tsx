import React from 'react';
import { Download, Plus } from 'lucide-react';

interface InventoryActionsProps {
  handleExport: () => void;
  setIsImportModalOpen: (isOpen: boolean) => void;
  handleAddProduct: () => void;
}

export const InventoryActions: React.FC<InventoryActionsProps> = ({
  handleExport,
  setIsImportModalOpen,
  handleAddProduct
}) => {
  return (
    <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 justify-start lg:justify-end no-scrollbar">
      <button
        onClick={handleExport}
        className="whitespace-nowrap px-3 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </button>

      <button
        onClick={() => setIsImportModalOpen(true)}
        className="whitespace-nowrap px-3 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4 rotate-180" />
        <span className="hidden sm:inline">Import</span>
      </button>

      <button
        onClick={handleAddProduct}
        className="whitespace-nowrap px-3 py-2 bg-[#369282] text-white rounded-lg text-sm font-medium hover:bg-[#2d7a6d] transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Product</span>
        <span className="sm:hidden">Add</span>
      </button>
    </div>
  );
};
