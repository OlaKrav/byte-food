import { Request, Response } from 'express';

export interface IUser {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
}

export interface UserContext {
  user: IUser | null;
  req: Request;
  res: Response;
}

export interface LoginArgs {
  email: string;
  password: string;
}

export interface RegisterArgs extends LoginArgs {
  name?: string;
}

export interface GoogleLoginArgs {
  idToken: string;
}

export interface JwtPayload {
  userId: string;
}

export function isJwtPayload(payload: unknown): payload is JwtPayload {
  return isObject(payload) && typeof payload.userId === 'string';
}

export interface NutrientValue {
  value: number;
  unit: string;
}

export interface NutrientRange {
  min: NutrientValue;
  max: NutrientValue;
}

export interface EssentialAminoAcids {
  lysine: NutrientValue;
  methionine: NutrientValue;
  tryptophan: NutrientValue;
  leucine: NutrientValue;
  isoleucine: NutrientValue;
  valine: NutrientValue;
  threonine: NutrientValue;
  phenylalanine: NutrientValue;
  histidine: NutrientValue;
}

export interface Vitamins {
  vitaminA: NutrientValue;
  vitaminC: NutrientValue;
  vitaminD: NutrientValue;
  vitaminE: NutrientValue;
  vitaminB1: NutrientValue;
  vitaminB2: NutrientValue;
  vitaminB6: NutrientValue;
  vitaminB9: NutrientValue;
  vitaminB12: NutrientValue;
}

export interface Minerals {
  zinc: NutrientValue;
  magnesium: NutrientValue;
  iodine: NutrientValue;
  iron: NutrientValue;
  calcium: NutrientValue;
}

export interface Macronutrients {
  calories: NutrientValue;
  protein: NutrientValue;
  fat: NutrientValue;
  omega3ALA: NutrientValue;
  carbs: NutrientValue;
  fiber: NutrientValue;
  water: NutrientValue;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  essentialAminoAcids: EssentialAminoAcids;
  vitamins: Vitamins;
  minerals: Minerals;
  macronutrients: Macronutrients;
}

interface MongoError {
  code?: number;
  codeName?: string;
  message?: string;
}

export function isMongoError(error: unknown): error is MongoError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'codeName' in error || 'message' in error)
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
