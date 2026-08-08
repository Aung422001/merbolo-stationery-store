import client from './client';

export const loginApi = (credentials) => client.post('/auth/login', credentials);
export const registerApi = (data) => client.post('/auth/register', data);
export const getMeApi = () => client.get('/auth/me');
