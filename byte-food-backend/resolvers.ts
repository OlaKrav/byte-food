import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { LoginArgs, UserContext, IUser, RegisterArgs, Food, isMongoError } from './types';
import { User } from './models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  createRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  setRefreshTokenCookie,
  createAuthTokens,
  formatUser,
} from './auth';
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  validateFoodName,
} from './validation';
import {
  UserExistsError,
  InvalidCredentialsError,
  NotFoundError,
  ValidationError,
  AppError,
} from './errors';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

let foodsData: Food[] = [];
try {
  const foodsPath = join(__dirname, 'foods.json');
  const foodsContent = readFileSync(foodsPath, 'utf-8');
  foodsData = JSON.parse(foodsContent);
} catch {
  throw new Error('FAILED_TO_LOAD_FOODS_DATA: Check if foods.json exists');
}

export const resolvers = {
  Query: {
    me: (
      _parent: unknown,
      _args: unknown,
      context: UserContext
    ): IUser | null => {
      return context.user;
    },
    food: (_parent: unknown, { name }: { name: string }) => {
      let validatedName: string;

      try {
        validatedName = validateFoodName(name);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new ValidationError(error.issues[0].message);
        }
        throw error;
      }

      const food = foodsData.find((f) =>
        f.name.toLowerCase().includes(validatedName.toLowerCase())
      );

      if (!food) {
        throw new NotFoundError(`Food "${validatedName}" not found`);
      }

      return food;
    },
    allFoods: () => {
      return foodsData.map((food) => ({
        id: food.id,
        name: food.name,
      }));
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      { email, password, name }: RegisterArgs,
      context: UserContext
    ) => {
      let validEmail: string;
      let validPassword: string;
      let validName: string | undefined;

      try {
        validEmail = emailSchema.parse(email);
        validPassword = passwordSchema.parse(password);
        validName = nameSchema.parse(name);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new ValidationError(error.issues[0].message);
        }
        throw error;
      }

      const existingUser = await User.findOne({ email: validEmail });
      if (existingUser) {
        throw new UserExistsError();
      }

      const hashedPassword = await bcrypt.hash(validPassword, 10);

      try {
        const user = await User.create({
          email: validEmail,
          passwordHash: hashedPassword,
          name: validName || validEmail.split('@')[0],
        });

        const { accessToken } = await createAuthTokens(
          user._id.toString(),
          context
        );

        return {
          token: accessToken,
          user: formatUser(user),
        };
      } catch (error: unknown) {
        if (isMongoError(error)) {
          const isDuplicate = 
            error.code === 11000 || 
            error.codeName === 'DuplicateKey' || 
            error.message?.includes('duplicate key');

          if (isDuplicate) throw new UserExistsError();
        } 
        throw error;
      }
    },

    login: async (
      _: unknown,
      { email, password }: LoginArgs,
      context: UserContext
    ) => {
      let validEmail: string;
      let validPassword: string;

      try {
        validEmail = emailSchema.parse(email);
        validPassword = z
          .string()
          .min(1, 'Password is required')
          .parse(password);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new ValidationError(error.issues[0].message);
        }
        throw error;
      }

      const user = await User.findOne({ email: validEmail });

      if (!user) {
        throw new InvalidCredentialsError();
      }

      if (!user.passwordHash) {
        throw new InvalidCredentialsError(
          'This account uses Google Login. Please sign in with Google.'
        );
      }

      const isPasswordValid = await bcrypt.compare(
        validPassword,
        user.passwordHash
      );
      if (!isPasswordValid) {
        throw new InvalidCredentialsError();
      }

      const { accessToken } = await createAuthTokens(
        user._id.toString(),
        context,
        true
      );

      return {
        token: accessToken,
        user: formatUser(user),
      };
    },

    authWithGoogle: async (
      _: unknown,
      { idToken }: { idToken: string },
      context: UserContext
    ) => {
      let validIdToken: string;

      try {
        validIdToken = z
          .string()
          .trim()
          .min(1, 'Google ID token is required')
          .parse(idToken);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new ValidationError(error.issues[0].message);
        }
        throw error;
      }

      try {
        const ticket = await client.verifyIdToken({
          idToken: validIdToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new InvalidCredentialsError('Google authentication failed');
        }

        let sanitizedEmail: string;
        let validatedName: string | undefined;

        try {
          sanitizedEmail = emailSchema.parse(payload.email);
          validatedName = payload.name
            ? nameSchema.parse(payload.name)
            : undefined;
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new ValidationError(error.issues[0].message);
          }
          throw error;
        }

        let user = await User.findOne({ email: sanitizedEmail });

        if (!user) {
          user = await User.create({
            email: sanitizedEmail,
            name: validatedName || sanitizedEmail.split('@')[0],
            avatar: payload.picture,
            googleId: payload.sub,
          });
        }

        const { accessToken } = await createAuthTokens(
          user._id.toString(),
          context,
          true
        );

        return {
          token: accessToken,
          user: formatUser(user),
        };
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new InvalidCredentialsError('Invalid Google Token');
      }
    },

    refreshToken: async (_: unknown, _args: unknown, context: UserContext) => {
      const refreshToken = context.req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new InvalidCredentialsError('Refresh token not found');
      }

      const user = await verifyRefreshToken(refreshToken);

      if (!user) {
        context.res.clearCookie('refreshToken');
        throw new InvalidCredentialsError('Invalid or expired refresh token');
      }

      const accessToken = generateAccessToken(user.id);
      const newRefreshToken = generateRefreshToken();

      await deleteRefreshToken(refreshToken);
      await createRefreshToken(user.id, newRefreshToken);
      setRefreshTokenCookie(context.res, newRefreshToken);

      return {
        token: accessToken,
        user,
      };
    },
  },
};
