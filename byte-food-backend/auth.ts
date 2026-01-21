import jwt from 'jsonwebtoken';
import { isJwtPayload, User } from './types';
import { SECRET_KEY } from './server';

export const getUser = (token: string): User | null => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, SECRET_KEY);

    if (typeof decoded !== 'string' && isJwtPayload(decoded)) {
      return {
        id: decoded.userId,
        email: 'test@test.com',
        name: 'Scientist',
      };
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
