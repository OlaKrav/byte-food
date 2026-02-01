import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import 'dotenv/config';
import mongoose from 'mongoose';

import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { getUser } from './auth';
import { formatError } from './errors';

export const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';
const PORT = +(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in .env');
}

async function init() {
  try {
    await mongoose.connect(MONGO_URI);
  } catch {
    throw new Error('Database connection failed');
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
  });

  await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      const user = await getUser(token);
      return { user };
    },
  });
}

init().catch(() => {
  process.exit(1);
});
