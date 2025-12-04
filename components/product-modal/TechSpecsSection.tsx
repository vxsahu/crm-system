interface TechSpecsSectionProps {
  techSpecs: {
    ram: string;
    processor: string;
    storage: string;
    color: string;
    generation: string;
    custom: string;
  };
  handleTechSpecChange: (field: keyof TechSpecsSectionProps['techSpecs'], value: string) => void;
  isTechCategory: boolean;
  specifications: string;
  handleChange: (field: string, value: string) => void;
  RAM_OPTIONS: string[];
  STORAGE_OPTIONS: string[];
  PROCESSOR_OPTIONS: string[];
  COLOR_OPTIONS: string[];
  GENERATION_OPTIONS: string[];
}

export const TechSpecsSection: React.FC<TechSpecsSectionProps> = ({
  techSpecs,
  handleTechSpecChange,
  isTechCategory,
  specifications,
  handleChange,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  PROCESSOR_OPTIONS,
  COLOR_OPTIONS,
  GENERATION_OPTIONS
}) => {
  return (
    <div className="md:col-span-2 space-y-4">
      <h3 className="text-sm font-semibold text-slate-600">Technical Specifications</h3>
      
      {isTechCategory ? (
         <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200 space-y-6">
            
            {/* Processor */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Processor</label>
                <select 
                    value={techSpecs.processor}
                    onChange={(e) => handleTechSpecChange('processor', e.target.value)}
                    className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] bg-white appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.75rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.25em 1.25em`, paddingRight: `2.5rem` }}
                >
                    <option value="">Select Processor</option>
                    {PROCESSOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            {/* Generation */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generation</label>
                <select 
                    value={techSpecs.generation}
                    onChange={(e) => handleTechSpecChange('generation', e.target.value)}
                    className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] bg-white appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.75rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.25em 1.25em`, paddingRight: `2.5rem` }}
                >
                    <option value="">Select Generation</option>
                    {GENERATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            {/* RAM Chips */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">RAM</label>
                <div className="flex flex-wrap gap-2">
                    {RAM_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => handleTechSpecChange('ram', opt === techSpecs.ram ? '' : opt)}
                            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
                                techSpecs.ram === opt 
                                    ? 'bg-[#369282] text-white border-[#369282]' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#369282] hover:text-[#369282]'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Storage Chips */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Storage</label>
                <div className="flex flex-wrap gap-2">
                     {STORAGE_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => handleTechSpecChange('storage', opt === techSpecs.storage ? '' : opt)}
                            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
                                techSpecs.storage === opt 
                                    ? 'bg-[#369282] text-white border-[#369282]' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#369282] hover:text-[#369282]'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
            
             {/* Color */}
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Color</label>
                <select 
                    value={techSpecs.color}
                    onChange={(e) => handleTechSpecChange('color', e.target.value)}
                    className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] bg-white appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.75rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.25em 1.25em`, paddingRight: `2.5rem` }}
                >
                    <option value="">Select Color</option>
                    {COLOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            {/* Custom Specs */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Specifications</label>
                <input
                    type="text"
                    value={techSpecs.custom}
                    onChange={(e) => handleTechSpecChange('custom', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400 text-sm"
                    placeholder="e.g. Backlit Keyboard, Touch Bar, 100% Battery Health..."
                />
            </div>

            <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Preview:</span>
                     <span className="text-sm font-medium text-slate-700">{specifications || 'No specs selected'}</span>
                </div>
            </div>
         </div>
      ) : (
        <input
            type="text"
            value={specifications}
            onChange={(e) => handleChange('specifications', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#369282] focus:border-[#369282] placeholder:text-slate-400"
            placeholder="e.g. Dimensions, Weight, Material"
        />
      )}
    </div>
  );
};
