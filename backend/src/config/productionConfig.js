// Validate configuration shape without printing secret values or contacting services.
export const validateProductionConfig = (env = process.env) => {
  if (env.NODE_ENV !== 'production') return;
  const errors = [];
  const secret = env.JWT_SECRET;
  if (typeof secret !== 'string' || secret.trim().length < 32 ||
      /^(replace_with|change_me|your_secret|placeholder)/i.test(secret.trim())) {
    errors.push('JWT_SECRET must be a non-placeholder secret of at least 32 characters');
  }
  if (typeof env.MONGODB_URI !== 'string' ||
      !/^mongodb(?:\+srv)?:\/\/\S+$/i.test(env.MONGODB_URI.trim())) {
    errors.push('MONGODB_URI must be a MongoDB connection URI');
  }
  try {
    const origin = new URL(env.CLIENT_URL);
    if (origin.protocol !== 'https:' || origin.username || origin.password ||
        origin.pathname !== '/' || origin.search || origin.hash) throw new Error();
  } catch {
    errors.push('CLIENT_URL must be an explicitly configured HTTPS origin');
  }
  if (env.PORT !== undefined && (!/^\d+$/.test(env.PORT) ||
      Number(env.PORT) < 1 || Number(env.PORT) > 65535)) {
    errors.push('PORT must be a valid TCP port');
  }
  if (errors.length) throw new Error('Production configuration invalid: ' + errors.join('; '));
};
