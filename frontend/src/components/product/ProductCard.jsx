import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';

export const ProductCard = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = product.stock <= 0;
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group bg-white rounded-2xl border border-brand-100/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image container */}
      <Link to={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-brand-50 block">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
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
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
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
        <div className="pt-2 border-t border-brand-50 flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-brand-900">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant={added ? 'secondary' : 'primary'}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="!px-3"
            title="Add to cart"
          >
            {added ? (
              <Check className="w-4 h-4 text-emerald-700" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
