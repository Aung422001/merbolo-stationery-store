import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, ShieldCheck, PenTool, BookOpen } from 'lucide-react';
import { getProductsApi } from '../api/products';
import { getCategoriesApi } from '../api/categories';
import { ProductGrid } from '../components/product/ProductGrid';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80"
];

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-orange-50 to-amber-50 py-16 sm:py-24 border-b border-brand-200">
        {/* Decorative background blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="animate-fade-in-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-700/10 border border-brand-600/30 text-brand-800 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse-soft" />
                Crafted for Stationery Lovers
              </div>
              <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight font-serif">
                <span className="gradient-text">Write, Plan &amp; Dream</span>
                <br />
                <span className="text-slate-900">with Beautiful Tools</span>
              </h1>
              <p className="animate-fade-in-up delay-200 text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                Discover curated Japanese notebooks, fountain pens, aesthetic washi tapes, and premium bullet journaling supplies.
              </p>
              <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Link
                  to="/shop"
                  className="btn-glow inline-flex items-center justify-center px-7 py-4 text-base font-bold text-white bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 rounded-xl shadow-lg hover:shadow-xl transition-all gap-2 hover:-translate-y-0.5"
                >
                  Explore Shop
                  <ArrowRight className="w-5 h-5" />
                </Link>

              </div>
            </div>

            {/* 3D Carousel Image Slider */}
            <div className="relative w-full max-w-lg aspect-[4/3] flex items-center justify-center animate-scale-in delay-200">
              <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                {HERO_IMAGES.map((src, index) => {
                  let position = "inactive";
                  let offset = index - currentSlide;

                  // Wrap index difference around array length
                  if (offset < -1) offset += HERO_IMAGES.length;
                  if (offset > 1) offset -= HERO_IMAGES.length;

                  // Adjust wrapping logic for edge cases where the difference is exactly half
                  if (offset === 0) {
                    position = "active";
                  } else if (offset === -1 || (offset === HERO_IMAGES.length - 1)) {
                    position = "prev";
                  } else if (offset === 1 || (offset === -1 * (HERO_IMAGES.length - 1))) {
                    position = "next";
                  }

                  const getPositionClasses = () => {
                    switch (position) {
                      case "active":
                        return "z-20 translate-x-0 scale-100 opacity-100 shadow-2xl border-4 border-white cursor-pointer";
                      case "prev":
                        return "z-10 -translate-x-16 sm:-translate-x-24 scale-75 opacity-40 pointer-events-none shadow-lg border-2 border-white/80";
                      case "next":
                        return "z-10 translate-x-16 sm:translate-x-24 scale-75 opacity-40 pointer-events-none shadow-lg border-2 border-white/80";
                      default:
                        return "opacity-0 scale-50 pointer-events-none z-0";
                    }
                  };

                  return (
                    <div
                      key={index}
                      onClick={() => position === "active" && setCurrentSlide((index + 1) % HERO_IMAGES.length)}
                      className={`absolute w-[60%] sm:w-[65%] aspect-square rounded-3xl overflow-hidden transition-all duration-500 ease-out transform ${getPositionClasses()}`}
                    >
                      <img
                        src={src}
                        alt={`Stationery slide ${index + 1}`}
                        className="w-full h-full object-cover select-none"
                        draggable="false"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Dot Indicators */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-slate-900/35 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                {HERO_IMAGES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === index ? 'bg-white w-4' : 'bg-white/60 hover:bg-white'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* MD Paper Floating badge */}
            <div className="absolute -bottom-10 -left-6 z-30 bg-white/85 backdrop-blur-md p-4.5 rounded-2xl border border-brand-200/60 shadow-xl hidden sm:flex items-center gap-3 animate-float-badge delay-400">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-300 to-brand-100 text-brand-700 flex items-center justify-center font-bold shadow-inner">
                <PenTool className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Bleed-resistant fountain pen paper</p>
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
              <p className="text-xs text-slate-500 mt-0.5">Complimentary shipping on orders over K 1,000 across Myanmar.</p>
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
