import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, ShieldCheck, PenTool, BookOpen } from 'lucide-react';
import { getProductsApi } from '../api/products';
import { getCategoriesApi } from '../api/categories';
import { ProductGrid } from '../components/product/ProductGrid';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProductsApi({ isFeatured: 'true', limit: 8 }),
          getCategoriesApi()
        ]);
        setFeaturedProducts(prodRes.data?.products || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-white py-16 sm:py-24 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-200/60 border border-brand-300 text-brand-900 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-brand-700" />
                Crafted for Stationery Lovers
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-serif">
                Write, Plan & Dream with Beautiful Tools
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                Discover curated Japanese notebooks, fountain pens, aesthetic washi tapes, and premium bullet journaling supplies.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md hover:shadow-lg transition-all gap-2"
                >
                  Explore Shop
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/shop?category=notebooks-journals"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-brand-900 bg-white hover:bg-brand-50 border border-brand-200 rounded-xl shadow-sm transition-all"
                >
                  View Journals
                </Link>
              </div>
            </div>

            {/* Hero Image Collage */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
                  alt="Stationery Journal & Pen"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-brand-100 shadow-xl hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">100% Authentic MD Paper</p>
                  <p className="text-[11px] text-slate-500">Bleed-resistant fountain pen paper</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 rounded-2xl border border-brand-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Free Express Delivery</h4>
              <p className="text-xs text-slate-500 mt-0.5">Complimentary shipping on orders over ฿1,000 across Thailand.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Curated Selection</h4>
              <p className="text-xs text-slate-500 mt-0.5">Handpicked Japanese, European & artisanal stationery brands.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Secure Checkout</h4>
              <p className="text-xs text-slate-500 mt-0.5">Protected card payment powered by Stripe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-baseline mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Shop by Category</h2>
            <p className="text-xs text-slate-500 mt-1">Find the perfect tool for your desk</p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end">
                <h3 className="font-bold text-white text-sm group-hover:text-brand-200 transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-baseline mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Featured Stationery</h2>
            <p className="text-xs text-slate-500 mt-1">Our most loved fountain pens and bullet journals</p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1">
            Browse Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} isLoading={loading} />
      </section>
    </div>
  );
};
