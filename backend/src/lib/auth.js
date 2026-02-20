import jwt from 'jsonwebtoken';

const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is not set');
    return secret;
};

export const signToken = (payload) => {
    return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, getSecret());
    } catch (error) {
        return null;
    }
};

export const getUserFromRequest = (req) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
};
