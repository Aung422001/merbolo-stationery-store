import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, ArrowLeft } from 'lucide-react';

export const AdminLayout = ({ children, title = 'Admin Dashboard' }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Storefront
          </Link>
          <h1 className="text-lg font-bold text-amber-400 border-l border-slate-700 pl-4">
            MerboloEbook Admin
          </h1>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl w-full mx-auto px-4 py-8 gap-8">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
              Management
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};
