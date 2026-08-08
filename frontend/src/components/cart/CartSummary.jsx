import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';

export const CartSummary = ({ checkoutButton = true }) => {
  const getSubtotal = useCartStore((state) => state.getSubtotal());
  const itemCount = useCartStore((state) => state.getItemCount());

  const subtotal = getSubtotal();
  const shippingFee = subtotal > 1000 || subtotal === 0 ? 0 : 50;
  const total = subtotal + shippingFee;

  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900 text-base border-b border-brand-100 pb-3 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-brand-600" />
        Order Summary
      </h3>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Estimated Shipping</span>
          <span className="font-semibold text-slate-800">
            {shippingFee === 0 ? (
              <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>

        {subtotal > 0 && subtotal < 1000 && (
          <p className="text-xs text-brand-700 bg-brand-50 p-2.5 rounded-lg border border-brand-100 leading-relaxed">
            Add <span className="font-bold">{formatCurrency(1000 - subtotal)}</span> more to your cart for FREE shipping!
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-brand-100 flex justify-between items-baseline">
        <span className="font-bold text-base text-slate-900">Total</span>
        <span className="font-extrabold text-xl text-brand-900">{formatCurrency(total)}</span>
      </div>

      {checkoutButton && (
        <Link to="/checkout" className="block pt-2">
          <Button variant="primary" size="lg" className="w-full gap-2">
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      )}
    </div>
  );
};
