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
  name?: string;
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

export interface RefreshTokenResponse {
  refreshToken: LoginPayload;
}

export interface LogoutResponse {
  logout: boolean;
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

export interface FoodData {
  food: Food;
}

export interface FoodVariables {
  name: string;
}

export interface FoodName {
  id: string;
  name: string;
}

export interface AllFoodsData {
  allFoods: FoodName[];
}
