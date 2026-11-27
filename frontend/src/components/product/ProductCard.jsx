import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';

export const ProductCard = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const isCartLoading = useCartStore((state) => state.isLoading);
  const cartItem = useCartStore((state) =>
    state.items.find((i) => i.productId === (product._id || product.id))
  );
  const quantityInCart = cartItem?.quantity || 0;

  const [imageFailed, setImageFailed] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCartLoading || quantityInCart >= product.stock) return;
    updateQuantity(product._id || product.id, quantityInCart + 1);
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCartLoading || quantityInCart <= 0) return;
    updateQuantity(product._id || product.id, quantityInCart - 1);
  };

  return (
    <div className="group bg-white rounded-2xl border border-brand-100/80 overflow-hidden shadow-sm hover-lift flex flex-col h-full animate-scale-in">
      {/* Image container */}
      <Link to={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-brand-50 block">
        {imageFailed ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-xs font-medium text-slate-500 bg-brand-50" role="img" aria-label={`${product.name} image unavailable`}>
            <svg viewBox="0 0 180 180" className="w-24 h-24 max-w-full" role="presentation" aria-hidden="true">
              <g transform="rotate(-35 90 90)">
                <rect x="74" y="22" width="32" height="88" rx="9" fill="#a6c8df" stroke="#597b94" strokeWidth="2" />
                <rect x="78" y="96" width="24" height="37" rx="4" fill="#f5f5f0" stroke="#597b94" strokeWidth="2" />
                <path d="M78 133 L90 163 L102 133 Z" fill="#d8dce2" stroke="#597b94" strokeWidth="2" />
                <path d="M90 145 L90 163" stroke="#597b94" strokeWidth="2" />
              </g>
            </svg>
            <span className="sr-only">Illustration shown because the product photo is unavailable</span>
          </div>
        ) : (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        {product.category?.name && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[11px] font-semibold text-brand-800 px-2.5 py-1 rounded-full shadow-sm">
            {product.category.name}
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-md shadow">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3 min-w-0">
        <div>
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-semibold text-slate-800 text-sm hover:text-brand-700 line-clamp-2 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-brand-50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-auto min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 min-w-0">
            <span className="text-base font-bold text-brand-900">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          {quantityInCart > 0 ? (
            <div className="flex items-center self-end shrink-0 gap-1.5 bg-brand-50 border border-brand-200 rounded-lg px-1 py-1">
              <button
                onClick={handleDecrease}
                disabled={isCartLoading}
                className="w-6 h-6 rounded-md hover:bg-brand-200 flex items-center justify-center text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center text-sm font-bold text-slate-800">
                {quantityInCart}
              </span>
              <button
                onClick={handleIncrease}
                disabled={isCartLoading || quantityInCart >= product.stock}
                className="w-6 h-6 rounded-md hover:bg-brand-200 flex items-center justify-center text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="primary"
              disabled={isOutOfStock || isCartLoading}
              onClick={handleAddToCart}
              className="!px-3 self-end shrink-0"
              title="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
