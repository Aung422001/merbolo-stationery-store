import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

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
  onReset
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-brand-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-brand-100 pb-3">
        <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          Filter Products
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-brand-700 hover:text-brand-900 flex items-center gap-1 font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Sort Select */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => onSelectSort(e.target.value)}
          className="w-full text-sm bg-brand-50/50 border border-brand-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
          Categories
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
              !selectedCategory
                ? 'bg-brand-600 text-white font-medium'
                : 'text-slate-600 hover:bg-brand-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat._id;
            return (
              <button
                key={cat._id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-brand-600 text-white font-medium'
                    : 'text-slate-600 hover:bg-brand-50'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
          Price Range (THB)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="!text-xs"
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="!text-xs"
          />
        </div>
      </div>
    </div>
  );
};
