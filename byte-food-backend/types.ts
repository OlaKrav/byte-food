export interface User {
  id: string;
  email: string;
  name: string;
}

export interface MyContext {
  user: User | null;
}

export interface LoginArgs {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
}

export function isJwtPayload(payload: unknown): payload is JwtPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'userId' in payload &&
    typeof (payload as Record<string, unknown>).userId === 'string'
  );
}
