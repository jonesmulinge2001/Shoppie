/* eslint-disable prettier/prettier */
import { Role } from 'generated/prisma';
/* eslint-disable prettier/prettier */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
