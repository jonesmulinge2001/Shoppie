/* eslint-disable prettier/prettier */
// src/types/request-with-user.ts
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}
