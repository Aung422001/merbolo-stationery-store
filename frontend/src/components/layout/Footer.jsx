import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">MerboloEbook</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated Japanese & global stationery, notebooks, fountain pens, and bullet journaling tools.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Shop Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shop?category=notebooks-journals" className="hover:text-brand-400">Notebooks & Journals</Link></li>
              <li><Link to="/shop?category=pens-pencils" className="hover:text-brand-400">Pens & Pencils</Link></li>
              <li><Link to="/shop?category=art-supplies" className="hover:text-brand-400">Art Supplies</Link></li>
              <li><Link to="/shop?category=paper-sticky-notes" className="hover:text-brand-400">Paper & Sticky Notes</Link></li>
              <li><Link to="/shop?category=books" className="hover:text-brand-400">Books</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Customer Service</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/cart" className="hover:text-brand-400">View Cart</Link></li>
              <li><Link to="/account" className="hover:text-brand-400">Order History</Link></li>
              <li><span className="text-slate-500">Shipping Policy (MMK 500 flat, free over K 10,000)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">About MerboloEbook</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built as a portfolio-grade full-stack e-commerce project with React, Express, and MongoDB.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MerboloEbook. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for stationery lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};
