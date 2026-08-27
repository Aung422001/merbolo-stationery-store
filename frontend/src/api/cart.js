import client from './client';

export const getCartApi = () => client.get('/cart');
export const addToCartApi = (productId, quantity = 1) => client.post('/cart/items', { productId, quantity });
export const updateCartItemApi = (productId, quantity) => client.put(`/cart/items/${productId}`, { quantity });
export const removeCartItemApi = (productId) => client.delete(`/cart/items/${productId}`);
export const clearCartApi = () => client.delete('/cart');
