import client from './client';

export const createOrderApi = (payload) => client.post('/orders', payload);
export const getMyOrdersApi = () => client.get('/orders');
export const getOrderByIdApi = (id) => client.get(`/orders/${id}`);
export const getAllOrdersAdminApi = (params = {}) => client.get('/orders/admin/all', { params });
export const updateOrderStatusAdminApi = (id, data) => client.put(`/orders/admin/${id}/status`, data);
export const getAdminMetricsApi = () => client.get('/orders/admin/metrics');
