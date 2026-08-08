import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, PackageCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import { getOrderByIdApi } from '../api/orders';
import { formatCurrency } from '../utils/formatCurrency';
import { Spinner } from '../components/ui/Spinner';

export const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderByIdApi(orderId);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <Spinner size="lg" className="min-h-[60vh]" />;
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/account" className="mt-4 inline-block text-sm text-brand-700 underline">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-brand-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">Thank You for Your Order!</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Your order has been confirmed and is being prepared for fulfillment.
        </p>
        <div className="inline-block bg-brand-50 border border-brand-200 px-4 py-2 rounded-xl text-xs font-mono font-bold text-brand-900">
          Order ID: #{order._id}
        </div>
      </div>

      {/* Order Details Card */}
      <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 text-base border-b border-brand-100 pb-3 flex items-center gap-2">
          <PackageCheck className="w-5 h-5 text-brand-600" />
          Order Items
        </h3>

        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-brand-50 last:border-0">
              <div>
                <p className="font-semibold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
              </div>
              <p className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-brand-100 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-brand-100">
            <span>Total Paid</span>
            <span className="text-brand-900">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="pt-4 border-t border-brand-100 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Shipping To</p>
          <p>{order.shippingAddress?.line1} {order.shippingAddress?.line2}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postalCode}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
        <Link
          to="/account"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-brand-200 text-slate-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
        >
          View Order History
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
