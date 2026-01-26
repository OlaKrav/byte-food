import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { SECRET_KEY } from './server';
import { LoginArgs, MyContext, IUser, RegisterArgs } from './types';
import { User } from './models/User';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const resolvers = {
  Query: {
    me: (_parent: unknown, _args: unknown, context: MyContext): IUser | null => {
      return context.user;
    },
  },
  Mutation: {
    register: async (_: unknown, { email, password, name }: RegisterArgs) => {

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        passwordHash: hashedPassword,
        name: name || email.split('@')[0],
      });

      const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
        expiresIn: '7d',
      });

      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      };
    },
    login: async (_: unknown, { email, password }: LoginArgs) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.passwordHash) {
        throw new Error('This account uses Google Login. Please sign in with Google.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
        expiresIn: '1h',
      });

      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      };
    },

    authWithGoogle: async (_: unknown, { idToken }: { idToken: string }) => {
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
          throw new Error('Google authentication failed');
        }

        const { email, name, picture, sub } = payload;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            name,
            avatar: picture,
            googleId: sub
          });
          console.log('🆕 Новый пользователь создан!');
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
          expiresIn: '1h',
        });

        return {
          token,
          user,
        };
      } catch (error) {
        console.error('Google Auth Error:', error);
        throw new Error('Invalid Google Token');
      }
    }
  }
};