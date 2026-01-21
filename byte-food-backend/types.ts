export interface User {
  id: string;
  email: string;
  name: string;
};

export interface MyContext {
  user: User | null;
};

export interface LoginArgs {
  email: string;
  password: string;
};

export interface JwtPayload {
  userId: string;
}

export function isJwtPayload(payload: any): payload is JwtPayload {
  return (
    payload &&
    typeof payload.userId === 'string'
  );
};