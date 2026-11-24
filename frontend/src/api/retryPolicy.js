// A network error does not prove a write failed to reach the server.
export const canRetryNetworkRequest = (error, maxRetries) => {
  const config = error?.config;
  const method = String(config?.method || 'get').toLowerCase();
  return error?.code === 'ERR_NETWORK' && Boolean(config) &&
    ['get', 'head'].includes(method) &&
    (config.__retryCount || 0) < maxRetries;
};
