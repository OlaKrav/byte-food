import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { SECRET_KEY } from './server';
import { LoginArgs, MyContext, User } from './types';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const resolvers = {
  Query: {
    me: (_parent: unknown, _args: unknown, context: MyContext): User | null => {
      return context.user;
    },
  },
  Mutation: {
    login: async (_: unknown, { email, password }: LoginArgs) => {
      const user = {
        id: '1',
        email: 'test@test.com',
        name: 'Scientist',
        passwordHash: '',
      };

      const isValid = email === 'test@test.com' && password === '123456';

      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
        expiresIn: '1h',
      });

      return {
        token,
        user,
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

        const user = {
          id: payload.sub,
          email: payload.email || '',
          name: payload.name || 'Google User',
          passwordHash: '',
        };

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