import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, PackageCheck, ShoppingBag, ArrowRight, Clock3, Truck, MapPin, XCircle } from 'lucide-react';
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

  const isDemo = order?.isDemo === true;
  const isPaid = order?.paymentStatus === 'paid';
  const stages = [
    { key: 'pending', title: 'Order Placed', icon: Clock3 },
    { key: 'processing', title: 'Processing', icon: PackageCheck },
    { key: 'shipped', title: 'Shipped', icon: Truck },
    { key: 'delivered', title: 'Delivered', icon: MapPin }
  ];
  const currentStage = stages.findIndex((stage) => stage.key === order?.orderStatus);
  const stopped = order?.orderStatus === 'cancelled' || order?.paymentStatus === 'failed';

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
        <h1 className="text-3xl font-extrabold text-slate-900 font-serif">{isDemo ? (isPaid ? 'Demo Payment Completed' : order.paymentStatus === 'failed' ? 'Demo Payment Declined' : 'Demo Payment Pending') : (isPaid ? 'Payment Confirmed' : 'Payment Pending')}</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          {isDemo ? 'This is a simulated portfolio order. No real money was collected.' : (isPaid ? 'Your payment was verified and your order is being processed.' : 'Your order is awaiting verified payment.')}
        </p>
        <div className="inline-block bg-brand-50 border border-brand-200 px-4 py-2 rounded-xl text-xs font-mono font-bold text-brand-900">
          Order ID: #{order._id}
        </div>
      </div>

      <section aria-label="Order tracking" className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-100 shadow-sm space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Track Your Order</h2>
          <span className="rounded-full bg-brand-50 text-brand-900 px-3 py-1 text-xs font-semibold capitalize">{order.orderStatus}</span>
        </div>
        {isDemo && <p className="text-xs rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900">Demo tracking only — no real parcel is shipped.</p>}
        {stopped ? (
          <div role="status" className="flex gap-3 rounded-xl bg-rose-50 p-4 text-rose-800">
            <XCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{order.orderStatus === 'cancelled' ? 'Order Cancelled' : 'Payment Declined'}</p>
          </div>
        ) : (
          <ol className="space-y-0">
            {stages.map((stage, index) => {
              const completed = index <= currentStage;
              const Icon = stage.icon;
              return (
                <li key={stage.key} className="flex gap-3 min-h-20">
                  <div className="flex flex-col items-center">
                    <div className={'w-9 h-9 rounded-full flex items-center justify-center shrink-0 ' + (completed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400')}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {index < stages.length - 1 && <div className={'w-0.5 flex-1 my-1 ' + (index < currentStage ? 'bg-emerald-500' : 'bg-slate-200')} />}
                  </div>
                  <div className="pb-5 pt-1">
                    <p className={'text-sm font-semibold ' + (completed ? 'text-slate-900' : 'text-slate-400')}>{stage.title}{index === currentStage ? ' · Current' : ''}</p>
                    <p className="text-xs text-slate-500 mt-1">{completed ? 'Stage reached' : 'Not yet reached'}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <p className="text-xs text-slate-500">Placed {new Date(order.createdAt).toLocaleString('en-GB')}. Refresh to see the latest status.</p>
      </section>

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
            <span>{isDemo ? 'Demo Order Total' : isPaid ? 'Total Paid' : 'Order Total'}</span>
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
