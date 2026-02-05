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

export interface AminoAcids {
  alanine: number;
  arginine: number;
  asparagine: number;
  aspartic_acid: number;
  cysteine: number;
  glutamic_acid: number;
  glutamine: number;
  glycine: number;
  histidine: number;
  isoleucine: number;
  leucine: number;
  lysine: number;
  methionine: number;
  phenylalanine: number;
  proline: number;
  serine: number;
  threonine: number;
  tryptophan: number;
  tyrosine: number;
  valine: number;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  amino_acids_g: AminoAcids;
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
