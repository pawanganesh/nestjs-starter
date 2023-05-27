export enum TokenType {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export interface IJWTPayload {
  sub: string;
  type: TokenType;
}
