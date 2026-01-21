import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import 'dotenv/config';

import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { getUser } from './auth';

export const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';
const PORT = +(process.env.PORT || 5000);

async function init() {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, { 
    listen: { port: PORT },
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      const user = getUser(token); 
      return { user };
    }
   });
  console.log(`🚀 Server ready at: ${url}`);
}

init().catch(err => console.error(err));