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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Stationery Shop</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {total} product{total === 1 ? '' : 's'}
          </p>
        </div>

        {/* Search Bar & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notebooks, pens, paper..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-white border border-brand-200 rounded-xl text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden md:block md:col-span-1">
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
          />
        </aside>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="md:hidden bg-white p-4 rounded-xl border border-brand-200 mb-4">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setPage(1);
                setShowMobileFilters(false);
              }}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              sort={sort}
              onSelectSort={setSort}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Products Area */}
        <main className="md:col-span-3 space-y-8">
          <ProductGrid products={products} isLoading={loading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg bg-white border border-brand-200 text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-xs font-semibold px-4 text-slate-700">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg bg-white border border-brand-200 text-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
