import client from './client';

export const getCategoriesApi = () => client.get('/categories');
export const createCategoryApi = (data) => client.post('/categories', data);
export const updateCategoryApi = (id, data) => client.put(`/categories/${id}`, data);
export const deleteCategoryApi = (id) => client.delete(`/categories/${id}`);
