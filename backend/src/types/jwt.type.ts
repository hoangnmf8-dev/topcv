export interface JwtPayload {
  accountId: string;
  role: string;
  jti: string;
  iat: number;
  exp: number;
}