import React from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { ProductStatus, BillingStatus } from '@/types';

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterBilling: string;
  setFilterBilling: (billing: string) => void;
  isFiltered: boolean;
  clearFilters: () => void;
  handleUnbilledFilter: () => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterBilling,
  setFilterBilling,
  isFiltered,
  clearFilters,
  handleUnbilledFilter
}) => {
  return (
    <div className="w-full lg:w-auto flex-1">
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1 sm:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Tag, Serial, Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400 shadow-sm"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-600 cursor-pointer min-w-[140px] appearance-none shadow-sm hover:border-slate-300 transition-colors"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
          >
            <option value="ALL">All Status</option>
            {Object.values(ProductStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filterBilling}
            onChange={(e) => setFilterBilling(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-600 cursor-pointer min-w-[140px] appearance-none shadow-sm hover:border-slate-300 transition-colors"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
          >
            <option value="ALL">All Billing</option>
            {Object.values(BillingStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {isFiltered && (
          <button
            onClick={clearFilters}
            className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors self-end sm:self-center border border-transparent hover:border-slate-200"
            title="Clear all filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
         <button
            onClick={handleUnbilledFilter}
            className="whitespace-nowrap px-4 py-2.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors flex items-center gap-2 sm:hidden shadow-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Unbilled</span>
          </button>
      </div>
    </div>
  );
};
