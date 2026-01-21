import jwt from 'jsonwebtoken';
import { SECRET_KEY } from './server';
import { LoginArgs, MyContext, User } from './types';

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
  },
};
