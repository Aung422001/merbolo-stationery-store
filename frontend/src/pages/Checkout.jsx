import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { createOrderApi } from '../api/orders';
import { createPaymentIntentApi } from '../api/payment';
import { CartSummary } from '../components/cart/CartSummary';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Checkout = () => {
  const { user } = useAuthStore();
  const { items, clearCart, getSubtotal } = useCartStore();
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

  const handleInputChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      // 1. Create Stripe Payment Intent (or mock test payment intent)
      const intentRes = await createPaymentIntentApi();
      const paymentIntentId = intentRes.data?.paymentIntentId || 'pi_test_mockPaymentIntent123';

      // 2. Create Order in DB
      const orderRes = await createOrderApi({
        shippingAddress: address,
        paymentIntentId
      });

      // 3. Clear cart store & redirect to order confirmation
      clearCart();
      const orderId = orderRes.data?._id;
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      console.error('Order creation failed:', err);
      setErrorMsg(err.message || 'Payment or order creation failed. Please check your shipping address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
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
        <p className="text-xs text-slate-500 mt-1">Shipping address & card payment</p>
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
                  <p className="text-sm font-semibold text-slate-800">Stripe Card Checkout (Test Mode)</p>
                  <p className="text-xs text-slate-500">Card payment simulation for demo orders</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1 space-y-6">
          <CartSummary checkoutButton={false} />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full gap-2 text-base font-bold shadow-lg"
          >
            Pay & Confirm Order
          </Button>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Encrypted 256-bit Stripe security
          </p>
        </div>
      </form>
    </div>
  );
};
