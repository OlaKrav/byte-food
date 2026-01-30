import jwt from 'jsonwebtoken';
import { isJwtPayload, IUser } from './types';
import { SECRET_KEY } from './server';
import { User } from './models/User';

export const getUser = async (token: string): Promise<IUser | null> => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, SECRET_KEY);

    if (typeof decoded !== 'string' && isJwtPayload(decoded)) {
      const user = await User.findById(decoded.userId).lean();
      if (user) {
        return {
          ...user,
          id: user._id.toString(),
        };
      }
    }
    return null;
  } catch {
    return null;
  }
};
