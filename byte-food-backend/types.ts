export interface IUser {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
}

export interface MyContext {
  user: IUser | null;
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
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'userId' in payload &&
    typeof (payload as Record<string, unknown>).userId === 'string'
  );
}
