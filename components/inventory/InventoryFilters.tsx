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
  filterMonth: string;
  setFilterMonth: (month: string) => void;
  filterYear: string;
  setFilterYear: (year: string) => void;
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
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  isFiltered,
  clearFilters,
  handleUnbilledFilter
}) => {
  const months = [
    { value: '0', label: 'Jan' },
    { value: '1', label: 'Feb' },
    { value: '2', label: 'Mar' },
    { value: '3', label: 'Apr' },
    { value: '4', label: 'May' },
    { value: '5', label: 'Jun' },
    { value: '6', label: 'Jul' },
    { value: '7', label: 'Aug' },
    { value: '8', label: 'Sep' },
    { value: '9', label: 'Oct' },
    { value: '10', label: 'Nov' },
    { value: '11', label: 'Dec' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="w-full lg:w-auto flex-1">
      <div className="flex flex-col gap-3 w-full">
        {/* Search Bar - Full width on mobile */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Tag, Serial, Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400"
          />
        </div>

        {/* Filters - Scrollable Row on Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 no-scrollbar">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-none px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 cursor-pointer min-w-[110px] appearance-nonehover:border-slate-300 transition-colors focus:ring-2 focus:ring-[#369282] focus:border-[#369282]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em`, paddingRight: `2rem` }}
          >
            <option value="ALL">Status</option>
            {Object.values(ProductStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filterBilling}
            onChange={(e) => setFilterBilling(e.target.value)}
            className="flex-none px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 cursor-pointer min-w-[110px] appearance-nonehover:border-slate-300 transition-colors focus:ring-2 focus:ring-[#369282] focus:border-[#369282]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em`, paddingRight: `2rem` }}
          >
            <option value="ALL">Billing</option>
            {Object.values(BillingStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="flex-none px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 cursor-pointer min-w-[100px] appearance-nonehover:border-slate-300 transition-colors focus:ring-2 focus:ring-[#369282] focus:border-[#369282]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em`, paddingRight: `2rem` }}
          >
            <option value="ALL">Month</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="flex-none px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 cursor-pointer min-w-[90px] appearance-nonehover:border-slate-300 transition-colors focus:ring-2 focus:ring-[#369282] focus:border-[#369282]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em`, paddingRight: `2rem` }}
          >
            <option value="ALL">Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex-none p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              title="Clear all filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

