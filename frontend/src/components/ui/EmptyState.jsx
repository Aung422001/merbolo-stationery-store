import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no items matching your criteria right now.',
  actionLabel,
  actionTo
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/70 border border-brand-100 rounded-2xl shadow-sm my-6">
      <div className="w-16 h-16 bg-brand-100/80 rounded-full flex items-center justify-center text-brand-700 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo}>
          <Button variant="primary" size="md">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
};
