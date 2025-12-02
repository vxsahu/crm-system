import React from 'react';
import { Download, Plus, AlertCircle } from 'lucide-react';

interface InventoryActionsProps {
  handleExport: () => void;
  setIsImportModalOpen: (isOpen: boolean) => void;
  handleAddProduct: () => void;
  handleUnbilledFilter: () => void;
}

export const InventoryActions: React.FC<InventoryActionsProps> = ({
  handleExport,
  setIsImportModalOpen,
  handleAddProduct,
  handleUnbilledFilter
}) => {
  return (
    <div className="flex gap-3 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0 justify-start xl:justify-end no-scrollbar">
      <button
        onClick={handleExport}
        className="whitespace-nowrap px-4 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </button>

      <button
        onClick={() => setIsImportModalOpen(true)}
        className="whitespace-nowrap px-4 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
      >
        <Download className="w-4 h-4 rotate-180" />
        <span className="hidden sm:inline">Import</span>
      </button>

      <button
        onClick={handleAddProduct}
        className="whitespace-nowrap px-4 py-2.5 bg-[#369282] text-white rounded-xl text-sm font-medium hover:bg-[#2d7a6d] transition-colors flex items-center gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add Product
      </button>
    </div>
  );
};
