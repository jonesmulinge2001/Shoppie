/* eslint-disable prettier/prettier */
import { UserStatus } from "generated/prisma";

/* eslint-disable prettier/prettier */
export class RegisterDto {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'CUSTOMER';
  status: UserStatus
}
