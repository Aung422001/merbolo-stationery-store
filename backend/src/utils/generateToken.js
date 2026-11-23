import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured');
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};
