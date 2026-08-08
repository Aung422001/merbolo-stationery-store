import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, PackageCheck, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getMyOrdersApi } from '../api/orders';
import { formatCurrency } from '../utils/formatCurrency';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

const statusStyles = {
  pending: 'bg-slate-100 text-slate-700',
  processing: 'bg-amber-100 text-amber-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-700'
};

export const Account = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrdersApi();
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-brand-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-serif">My Account</h1>
        <p className="text-xs text-slate-500 mt-1">Profile details and order history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>

            {defaultAddress && (
              <div className="pt-4 border-t border-brand-100 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Default Address
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {defaultAddress.line1} {defaultAddress.line2}
                  <br />
                  {defaultAddress.city}, {defaultAddress.province} {defaultAddress.postalCode}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-brand-600" />
            Order History
          </h3>

          {loading ? (
            <Spinner size="lg" />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={PackageCheck}
              title="No orders yet"
              description="Your past orders will show up here once you place one."
              actionLabel="Start Shopping"
              actionTo="/shop"
            />
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  to={`/order-confirmation/${order._id}`}
                  className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-brand-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-700">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items.length} item{order.items.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${statusStyles[order.orderStatus] || statusStyles.pending}`}>
                      {order.orderStatus}
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{formatCurrency(order.total)}</p>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
