import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { getProductsApi } from '../api/products';
import { getCategoriesApi } from '../api/categories';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilters } from '../components/product/ProductFilters';
import { useDebounce } from '../hooks/useDebounce';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const debouncedMinPrice = useDebounce(minPrice, 400);
  const debouncedMaxPrice = useDebounce(maxPrice, 400);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchTerm(searchParams.get('search') || '');
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesApi();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await getProductsApi({
          category: selectedCategory,
          search: debouncedSearch,
          minPrice: debouncedMinPrice,
          maxPrice: debouncedMaxPrice,
          sort,
          page,
          limit: 12
        });
        setProducts(res.data?.products || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.pages || 1);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, debouncedSearch, debouncedMinPrice, debouncedMaxPrice, sort, page]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Horizontal Filter Bar (Includes Search bar inside) */}
      <ProductFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setPage(1);
        }}
        minPrice={minPrice}
        setMinPrice={(val) => {
          setMinPrice(val);
          setPage(1);
        }}
        maxPrice={maxPrice}
        setMaxPrice={(val) => {
          setMaxPrice(val);
          setPage(1);
        }}
        sort={sort}
        onSelectSort={setSort}
        onReset={handleResetFilters}
        searchTerm={searchTerm}
        setSearchTerm={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
      />

      {/* Products Grid Area (Full Width) */}
      <main className="space-y-8">
        <ProductGrid products={products} isLoading={loading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg bg-white border border-brand-200 text-slate-700 disabled:opacity-40 transition-colors hover:bg-brand-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold px-4 text-slate-700">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg bg-white border border-brand-200 text-slate-700 disabled:opacity-40 transition-colors hover:bg-brand-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
