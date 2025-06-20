/* eslint-disable prettier/prettier */
export interface JwtPayload {
    sub: string;
    email: string;
    role: 'ADMIN' | 'CUSTOMER';
  }
  