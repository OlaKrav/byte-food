export interface User {
  id: string;
  email: string;
  name: string;
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

export interface LoginVariables {
  email: string;
  password?: string;
}