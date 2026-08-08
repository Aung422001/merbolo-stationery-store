import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, Truck, ShieldCheck, Plus, Minus } from 'lucide-react';
import { getProductBySlugApi } from '../api/products';
import { formatCurrency } from '../utils/formatCurrency';
import { useCartStore } from '../store/cartStore';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductBySlugApi(slug);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return <Spinner size="lg" className="min-h-[60vh]" />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The requested stationery product could not be located.</p>
        <Link to="/shop" className="inline-block mt-4 text-sm text-brand-700 font-semibold underline">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'];

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-700">
        <ArrowLeft className="w-4 h-4" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-brand-100 shadow-sm">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-brand-50 rounded-2xl overflow-hidden border border-brand-100">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors shrink-0 ${
                    selectedImage === i ? 'border-brand-600' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {product.category?.name && (
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-3 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif leading-tight">
              {product.name}
            </h1>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-extrabold text-brand-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-base text-slate-400 line-through font-medium">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  <Check className="w-3.5 h-3.5" />
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-brand-100">
              {product.description}
            </p>
          </div>

          {/* Action Box */}
          <div className="space-y-4 pt-6 border-t border-brand-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-brand-200 rounded-xl bg-brand-50/50 p-1">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 shadow-sm disabled:opacity-50"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 shadow-sm disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <Button
                size="lg"
                variant={added ? 'secondary' : 'primary'}
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 gap-2 text-sm"
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-700" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart — {formatCurrency(product.price * quantity)}
                  </>
                )}
              </Button>
            </div>

            {/* Shipping note */}
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-600" />
                <span>Fast Thai Courier Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Authentic Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
