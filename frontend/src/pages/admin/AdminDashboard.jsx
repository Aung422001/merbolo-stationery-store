import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, DollarSign, AlertTriangle, Package, FolderTree, ArrowRight } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { getAdminMetricsApi } from '../../api/orders';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await getAdminMetricsApi();
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const cards = [
    {
      label: 'Total Orders',
      value: metrics?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: 'text-blue-700 bg-blue-100'
    },
    {
      label: 'Total Revenue (Paid)',
      value: formatCurrency(metrics?.totalRevenue ?? 0),
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-100'
    },
    {
      label: 'Low Stock Products (≤5)',
      value: metrics?.lowStockProducts ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-700 bg-amber-100'
    }
  ];

  const shortcuts = [
    { label: 'Manage Products', to: '/admin/products', icon: Package },
    { label: 'Manage Categories', to: '/admin/categories', icon: FolderTree },
    { label: 'Manage Orders', to: '/admin/orders', icon: ShoppingCart }
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{card.value}</p>
                    <p className="text-xs text-slate-500">{card.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shortcuts.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.to}
                    to={s.to}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors group"
                  >
                    <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                      {s.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
