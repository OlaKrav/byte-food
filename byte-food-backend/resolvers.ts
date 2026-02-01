import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { SECRET_KEY } from './server';
import { LoginArgs, MyContext, IUser, RegisterArgs, Food } from './types';
import { User } from './models/User';
import { 
  emailSchema, 
  passwordSchema, 
  nameSchema,
  validateFoodName
} from './validation';

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
    me: (_parent: unknown, _args: unknown, context: MyContext): IUser | null => {
      return context.user;
    },
    food: (_parent: unknown, { name }: { name: string }) => {
      const validatedName = validateFoodName(name);

      const food = foodsData.find((f) =>
        f.name.toLowerCase().includes(validatedName.toLowerCase())
      );

      if (!food) {
        throw new Error(`Food "${validatedName}" not found`);
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
    register: async (_: unknown, { email, password, name }: RegisterArgs) => {
      const validEmail = emailSchema.parse(email);
      const validPassword = passwordSchema.parse(password);
      const validName = nameSchema.parse(name);

      const existingUser = await User.findOne({ email: validEmail });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(validPassword, 10);

      const user = await User.create({
        email: validEmail,
        passwordHash: hashedPassword,
        name: validName || validEmail.split('@')[0],
      });

      const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '7d' });

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
      const validEmail = emailSchema.parse(email);
      const validPassword = z.string().min(1, "Password is required").parse(password);

      const user = await User.findOne({ email: validEmail });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.passwordHash) {
        throw new Error('This account uses Google Login. Please sign in with Google.');
      }

      const isPasswordValid = await bcrypt.compare(validPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

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
      const validIdToken = z.string().trim().min(1, "Google ID token is required").parse(idToken);

      try {
        const ticket = await client.verifyIdToken({
          idToken: validIdToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new Error('Google authentication failed');
        }

        const sanitizedEmail = emailSchema.parse(payload.email);
        const validatedName = payload.name ? nameSchema.parse(payload.name) : undefined;

        let user = await User.findOne({ email: sanitizedEmail });

        if (!user) {
          user = await User.create({
            email: sanitizedEmail,
            name: validatedName || sanitizedEmail.split('@')[0],
            avatar: payload.picture,
            googleId: payload.sub,
          });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

        return { token, user };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(error.issues[0].message);
        }
        throw error instanceof Error ? error : new Error('Invalid Google Token');
      }
    },
  },
};