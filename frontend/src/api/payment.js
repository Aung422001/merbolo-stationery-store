import client from './client';

export const createPaymentIntentApi = (payload = {}) => client.post('/payment/create-intent', payload);

export const confirmDemoPaymentApi = (payload) => client.post('/payment/demo/confirm', payload);
