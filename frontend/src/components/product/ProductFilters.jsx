import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';

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

      {/* Lower line: Dropdowns & Price inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3 border-t border-brand-100/60">
        {/* Category Select */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="w-full text-sm bg-white border border-brand-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Select */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Sort By
          </label>
          <select
            value={sort}
            onChange={(e) => onSelectSort(e.target.value)}
            className="w-full text-sm bg-white border border-brand-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

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
