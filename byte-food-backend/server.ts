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

export const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in .env');
}

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

  const app = express();
  const server = new ApolloServer<UserContext>({
    typeDefs,
    resolvers,
    formatError,
  });

  await server.start();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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