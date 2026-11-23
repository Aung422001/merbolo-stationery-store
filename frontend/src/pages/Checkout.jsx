import React, { useState } from 'react';
import { CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';
import { createOrderApi } from '../api/orders';
import { confirmDemoPaymentApi } from '../api/payment';
import { CartSummary } from '../components/cart/CartSummary';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Checkout = () => {
  const { user } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const navigate = useNavigate();

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || {};

  const [address, setAddress] = useState({
    line1: defaultAddress.line1 || '',
    line2: defaultAddress.line2 || '',
    city: defaultAddress.city || 'Bangkok',
    province: defaultAddress.province || 'Bangkok',
    postalCode: defaultAddress.postalCode || '10110',
    country: 'TH'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [payment, setPayment] = useState(null);
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoResult, setDemoResult] = useState(null);

  const finishDemo = async (outcome) => {
    if (!payment || demoBusy) return;
    setDemoBusy(true);
    setErrorMsg('');
    try {
      const response = await confirmDemoPaymentApi({ orderId: payment.orderId, outcome });
      if (!response.success) throw new Error('Demo payment failed');
      setDemoResult(outcome);
      if (outcome === 'success') await fetchCart();
    } catch (error) { setErrorMsg(error.message || 'Unable to finish demo payment'); }
    finally { setDemoBusy(false); }
  };

  const handleInputChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const orderRes = await createOrderApi({ shippingAddress: address });
      const orderId = orderRes.data?._id;
      if (!orderId) throw new Error('Order could not be created');
      setPayment({ orderId });
    } catch (err) {
      console.error('Order creation failed:', err);
      setErrorMsg(err.message || 'Order creation failed. Please check your shipping address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !payment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-2">Add items to your cart before proceeding to checkout.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-brand-100 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-serif">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Shipping address & simulated payment</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping & Payment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Form */}
          <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-brand-100 pb-3">
              <Truck className="w-5 h-5 text-brand-600" />
              1. Shipping Address
            </h3>

            <div className="space-y-3">
              <Input
                label="Address Line 1"
                required
                placeholder="House no., street, building..."
                value={address.line1}
                onChange={(e) => handleInputChange('line1', e.target.value)}
              />
              <Input
                label="Address Line 2 (Optional)"
                placeholder="Apartment, suite, unit..."
                value={address.line2}
                onChange={(e) => handleInputChange('line2', e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="City"
                  required
                  value={address.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
                <Input
                  label="Province"
                  required
                  value={address.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                />
                <Input
                  label="Postal Code"
                  required
                  value={address.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-brand-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-brand-100 pb-3">
              <CreditCard className="w-5 h-5 text-brand-600" />
              2. Payment Method
            </h3>

            <div className="p-4 bg-brand-50 rounded-xl border border-brand-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-brand-700 shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Demo Payment — No Real Money</p>
                  <p className="text-xs text-slate-500">Simulate success or failure without card details</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1 space-y-6">
          <CartSummary checkoutButton={false} />

          {/* Shipping Policy Notice */}
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-700 shrink-0" />
              <p className="text-sm font-bold text-brand-900">Shipping Policy</p>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold mt-0.5">•</span>
                Flat shipping fee: <span className="font-semibold text-slate-800 ml-1">THB 50</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                Orders over <span className="font-semibold text-slate-800 mx-1">THB 1,000</span> get <span className="font-bold text-emerald-600 ml-1">FREE shipping!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-600 font-bold mt-0.5">•</span>
                Delivery within Thailand only
              </li>
            </ul>
          </div>

          <Button
            disabled={Boolean(payment) || isSubmitting}
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full gap-2 text-base font-bold shadow-lg"
          >
            Create Demo Order
          </Button>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Portfolio demonstration only — no real payment is collected
          </p>
        </div>
      </form>
      {payment && <section className="bg-white rounded-2xl border border-brand-100 p-6 space-y-4" aria-label="Demo payment controls">
        <h2 className="text-lg font-bold">Simulated Payment</h2>
        <p className="text-sm text-slate-600">This is a portfolio demo. No real payment is processed and no card details are needed.</p>
        {demoResult ? <div role="status" className="space-y-3"><p>{demoResult === 'success' ? 'Demo payment completed.' : 'Demo payment declined.'}</p><button type="button" className="text-brand-700 underline" onClick={() => navigate('/order-confirmation/' + payment.orderId)}>View Demo Order</button>{demoResult === 'failure' && <button type="button" className="ml-4 text-brand-700 underline" onClick={() => { setPayment(null); setDemoResult(null); }}>Try a New Demo Order</button>}</div> : <div className="flex flex-wrap gap-3"><Button type="button" disabled={demoBusy} onClick={() => finishDemo('success')}>Simulate Success</Button><Button type="button" disabled={demoBusy} onClick={() => finishDemo('failure')}>Simulate Decline</Button></div>}
      </section>}
    </div>
  );
};
