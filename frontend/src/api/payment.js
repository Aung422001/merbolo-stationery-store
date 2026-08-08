import client from './client';

export const createPaymentIntentApi = (payload = {}) => client.post('/payment/create-intent', payload);
