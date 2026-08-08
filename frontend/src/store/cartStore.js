import { create } from 'zustand';
import { getCartApi, addToCartApi, updateCartItemApi, removeCartItemApi } from '../api/cart';
import { useAuthStore } from './authStore';

const GUEST_CART_KEY = 'merbolo_guest_cart';

const loadGuestCart = () => {
  try {
    const data = localStorage.getItem(GUEST_CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
};

const saveGuestCart = (items) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save guest cart to localStorage:', err);
  }
};

export const useCartStore = create((set, get) => ({
  items: loadGuestCart(),
  isLoading: false,

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const price = item.product?.price ?? item.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
  },

  fetchCart: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    set({ isLoading: true });
    try {
      const response = await getCartApi();
      const serverItems = (response.data?.items || []).map((i) => ({
        productId: i.product._id || i.product,
        product: i.product,
        quantity: i.quantity,
        price: i.product?.price || i.priceAtAdd
      }));
      set({ items: serverItems, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user cart:', error);
      set({ isLoading: false });
    }
  },

  addItem: async (product, quantity = 1) => {
    const { isAuthenticated } = useAuthStore.getState();
    const productId = product._id || product.id;

    if (isAuthenticated) {
      try {
        set({ isLoading: true });
        await addToCartApi(productId, quantity);
        await get().fetchCart();
      } catch (error) {
        console.error('Failed to add item to server cart:', error);
        set({ isLoading: false });
      }
    } else {
      const currentItems = [...get().items];
      const existingIndex = currentItems.findIndex((i) => i.productId === productId);

      if (existingIndex > -1) {
        currentItems[existingIndex].quantity += quantity;
      } else {
        currentItems.push({
          productId,
          product,
          quantity,
          price: product.price
        });
      }

      saveGuestCart(currentItems);
      set({ items: currentItems });
    }
  },

  updateQuantity: async (productId, quantity) => {
    const { isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated) {
      try {
        set({ isLoading: true });
        await updateCartItemApi(productId, quantity);
        await get().fetchCart();
      } catch (error) {
        console.error('Failed to update server cart quantity:', error);
        set({ isLoading: false });
      }
    } else {
      let currentItems = [...get().items];
      if (quantity <= 0) {
        currentItems = currentItems.filter((i) => i.productId !== productId);
      } else {
        const index = currentItems.findIndex((i) => i.productId === productId);
        if (index > -1) {
          currentItems[index].quantity = quantity;
        }
      }
      saveGuestCart(currentItems);
      set({ items: currentItems });
    }
  },

  removeItem: async (productId) => {
    const { isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated) {
      try {
        set({ isLoading: true });
        await removeCartItemApi(productId);
        await get().fetchCart();
      } catch (error) {
        console.error('Failed to remove server cart item:', error);
        set({ isLoading: false });
      }
    } else {
      const currentItems = get().items.filter((i) => i.productId !== productId);
      saveGuestCart(currentItems);
      set({ items: currentItems });
    }
  },

  clearCart: () => {
    localStorage.removeItem(GUEST_CART_KEY);
    set({ items: [] });
  },

  mergeGuestCartOnLogin: async () => {
    const guestItems = loadGuestCart();
    if (guestItems.length === 0) {
      await get().fetchCart();
      return;
    }

    try {
      set({ isLoading: true });
      for (const item of guestItems) {
        await addToCartApi(item.productId, item.quantity);
      }
      localStorage.removeItem(GUEST_CART_KEY);
      await get().fetchCart();
    } catch (error) {
      console.error('Failed to merge guest cart on login:', error);
      set({ isLoading: false });
    }
  }
}));
