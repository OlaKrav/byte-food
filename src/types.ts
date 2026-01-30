export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
}

export interface GetMeData {
  me: User | null;
}

export interface LoginPayload {
  token: string;
  user: User;
}

export interface LoginResponse {
  login: LoginPayload;
}

export interface RegisterResponse {
  register: LoginPayload;
}

export interface LoginVariables {
  email: string;
  password: string;
}

export interface RegisterVariables {
  email: string;
  password: string;
  name?: string
}

export interface GoogleAuthResponse {
  authWithGoogle: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
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

export interface FoodData {
  food: Food;
}

export interface FoodVariables {
  name: string;
}