import { UserStatus } from "@prisma/client";

export class AuthUserDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  status!: UserStatus;
  lastLoginAt!: Date | null;
}

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: AuthUserDto;
}

export class AccessTokenResponseDto {
  accessToken!: string;
}
