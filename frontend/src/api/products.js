import client from './client';

export const getProductsApi = (params = {}) => client.get('/products', { params });
export const getProductBySlugApi = (slug) => client.get(`/products/${slug}`);
export const createProductApi = (data) => client.post('/products', data);
export const updateProductApi = (id, data) => client.put(`/products/${id}`, data);
export const deleteProductApi = (id) => client.delete(`/products/${id}`);
