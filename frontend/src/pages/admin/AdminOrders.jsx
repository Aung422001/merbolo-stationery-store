import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { getAllOrdersAdminApi, updateOrderStatusAdminApi } from '../../api/orders';

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusStyles = {
  pending: 'bg-slate-100 text-slate-700',
  processing: 'bg-amber-100 text-amber-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-700'
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const res = await getAllOrdersAdminApi(status ? { status } : {});
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  const handleStatusChange = async (order, newStatus) => {
    setUpdatingId(order._id);
    try {
      const res = await updateOrderStatusAdminApi(order._id, { orderStatus: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? res.data : o)));
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout title="Orders">
      <div className="flex justify-end mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Statuses</option>
          {orderStatuses.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner size="lg" />
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders found" description="Orders will appear here once customers check out." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4">
                    <p className="font-mono text-xs font-bold text-slate-700">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-slate-800">{order.user?.name}</p>
                    <p className="text-xs text-slate-400">{order.user?.email}</p>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-slate-800">{formatCurrency(order.total)}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={order.orderStatus}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className={`text-xs font-bold uppercase px-2.5 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 ${statusStyles[order.orderStatus] || statusStyles.pending}`}
                    >
                      {orderStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};
