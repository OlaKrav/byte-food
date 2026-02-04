import { ApolloServer, HeaderMap } from '@apollo/server';
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { getUser } from './auth';
import { formatError } from './errors';
import { UserContext } from './types';

const SECRET_KEY = process.env.JWT_SECRET;
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!SECRET_KEY) {
  throw new Error('JWT_SECRET is not defined in .env');
}

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in .env');
}

if (!GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is not defined in .env');
}

export { SECRET_KEY };

async function init() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in .env');
  }
  
  try {
    await mongoose.connect(MONGO_URI);
    console.info('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw new Error('Database connection failed');
  }

  const isDevelopment = process.env.NODE_ENV !== 'production';

  const app = express();
  const server = new ApolloServer<UserContext>({
    typeDefs,
    resolvers,
    formatError,
    introspection: isDevelopment
  });

  await server.start();

  app.use(
    cors({
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        // sandbox 'https://studio.apollographql.com'
      ],
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());

  app.use('/graphql', async (req, res) => {
    const headers = new HeaderMap();
    
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        headers.set(
          key,
          Array.isArray(value) ? value.join(', ') : String(value)
        );
      }
    });

    const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method: req.method.toUpperCase(),
        headers,
        body: req.body,
        search: new URL(req.url, `http://${req.headers.host}`).search,
      },
      context: async () => {
        const rawAuth = req.headers['authorization'];
        const authHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;
        const token = (authHeader || '').replace('Bearer ', '');
        
        const user = await getUser(token);
        return { user, req, res };
      },
    });

    httpGraphQLResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(httpGraphQLResponse.status || 200);

    if (httpGraphQLResponse.body.kind === 'complete') {
      res.send(httpGraphQLResponse.body.string);
    } else {
      for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
        res.write(chunk);
      }
      res.end();
    }
  });

  app.listen(PORT, () => {
    console.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

init().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});