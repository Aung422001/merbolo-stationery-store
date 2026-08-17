import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCartStore } from '../../store/cartStore';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();

  if (!item) return null;

  const isProductObj = typeof item.product === 'object' && item.product !== null;
  const product = isProductObj ? item.product : {};
  const productId = item.productId || product._id || (typeof item.product === 'string' ? item.product : '');
  const name = product.name || item.name || 'Stationery Item';
  const price = product.price ?? item.price ?? 0;
  const image = (Array.isArray(product.images) && product.images[0]) || item.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
  const slug = product.slug || item.slug || '#';
  const quantity = item.quantity || 1;

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-brand-100 shadow-sm">
      {/* Product Image & Title */}
      <div className="flex items-center gap-4 flex-1">
        <Link to={`/product/${slug}`} className="w-16 h-16 shrink-0 bg-brand-50 rounded-lg overflow-hidden border border-brand-100">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </Link>
        <div className="space-y-1">
          <Link to={`/product/${slug}`} className="font-semibold text-sm text-slate-800 hover:text-brand-700 line-clamp-1">
            {name}
          </Link>
          <p className="text-xs text-brand-800 font-bold">{formatCurrency(price)}</p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(productId, quantity - 1)}
          className="w-7 h-7 rounded-md bg-brand-100 hover:bg-brand-200 flex items-center justify-center text-slate-700 transition-colors"
          title="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-semibold text-slate-800">
          {quantity}
        </span>
        <button
          onClick={() => updateQuantity(productId, quantity + 1)}
          className="w-7 h-7 rounded-md bg-brand-100 hover:bg-brand-200 flex items-center justify-center text-slate-700 transition-colors"
          title="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Line Total */}
      <div className="text-right w-24 shrink-0">
        <p className="text-sm font-bold text-slate-900">
          {formatCurrency(price * quantity)}
        </p>
      </div>

      {/* Delete button */}
      <button
        onClick={() => removeItem(productId)}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        title="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
