import React, { useEffect, useRef, useState } from 'react';
import { Filter, RotateCcw, Search, ChevronDown, Check } from 'lucide-react';

const FilterDropdown = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 text-sm bg-white border border-brand-200 rounded-xl px-3 py-2.5 text-slate-700 hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-all"
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-1.5 w-full bg-white border border-brand-100 rounded-xl shadow-lg py-1.5 max-h-64 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-left transition-colors cursor-pointer ${
                  opt.value === value ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-brand-50/60'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ProductFilters = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sort,
  onSelectSort,
  onReset,
  searchTerm,
  setSearchTerm
}) => {
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat.slug, label: cat.name }))
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' }
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-100 shadow-sm space-y-4">
      {/* Upper line: Search Bar and Reset button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Unified Search Input */}
        <div className="relative flex-1">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notebooks, pens, paper..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-brand-50/20 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Filters title & Reset Button */}
        <div className="flex items-center justify-between sm:justify-end gap-4 px-1 sm:px-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:inline-flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-600" />
            Filters
          </span>
          <button
            onClick={onReset}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Lower line: Dropdown buttons & Price inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3 border-t border-brand-100/60">
        <FilterDropdown
          label="Category"
          value={selectedCategory}
          options={categoryOptions}
          onChange={onSelectCategory}
        />

        <FilterDropdown
          label="Sort By"
          value={sort}
          options={sortOptions}
          onChange={onSelectSort}
        />

        {/* Price Min (MMK) */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Min Price (MMK)
          </label>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full text-sm bg-white border border-brand-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Price Max (MMK) */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Max Price (MMK)
          </label>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full text-sm bg-white border border-brand-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>
    </div>
  );
};
