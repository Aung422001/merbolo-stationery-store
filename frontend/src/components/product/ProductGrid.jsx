import React from 'react';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../ui/EmptyState';

export const ProductGrid = ({ products = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 h-80 animate-pulse border border-brand-100 flex flex-col justify-between">
            <div className="bg-brand-100 rounded-xl aspect-square w-full"></div>
            <div className="space-y-2 mt-4">
              <div className="h-4 bg-brand-100 rounded w-3/4"></div>
              <div className="h-3 bg-brand-100 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-brand-100 rounded mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No stationery found"
        description="Try clearing filters or searching for something else."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};
