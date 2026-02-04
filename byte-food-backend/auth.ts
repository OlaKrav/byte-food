import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { isJwtPayload, IUser, UserContext } from './types';
import { SECRET_KEY } from './server';
import { User } from './models/User';
import { RefreshToken } from './models/RefreshToken';

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

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '3m' });
};

export const generateRefreshToken = (): string => {
  return randomBytes(40).toString('hex');
};

export const createRefreshToken = async (
  userId: string,
  token: string
): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    token,
    userId,
    expiresAt,
  });
};

export const verifyRefreshToken = async (
  token: string
): Promise<IUser | null> => {
  try {
    const refreshTokenDoc = await RefreshToken.findOne({ token });

    if (!refreshTokenDoc) {
      return null;
    }

    if (refreshTokenDoc.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token });
      return null;
    }

    const user = await User.findById(refreshTokenDoc.userId).lean();
    if (user) {
      return {
        ...user,
        id: user._id.toString(),
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
  await RefreshToken.deleteOne({ token });
};

export const deleteAllUserRefreshTokens = async (
  userId: string
): Promise<void> => {
  await RefreshToken.deleteMany({ userId });
};

export const setRefreshTokenCookie = (
  res: UserContext['res'],
  token: string
): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const createAuthTokens = async (
  userId: string,
  context: UserContext,
  shouldDeleteOldTokens = false
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken();

  if (shouldDeleteOldTokens) {
    await deleteAllUserRefreshTokens(userId);
  }
  await createRefreshToken(userId, refreshToken);
  setRefreshTokenCookie(context.res, refreshToken);

  return { accessToken, refreshToken };
};

export const formatUser = (user: {
  _id: { toString: () => string };
  email: string;
  name?: string | null;
  avatar?: string | null;
}): IUser => {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || null,
    avatar: user.avatar || null,
  };
};
