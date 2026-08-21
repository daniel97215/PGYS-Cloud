import { SetMetadata } from "@nestjs/common";
import { PlatformOperatorRole } from "@prisma/client";

export const PLATFORM_ROLES_KEY = "platformRoles";

export const PlatformRoles = (...roles: PlatformOperatorRole[]) =>
  SetMetadata(PLATFORM_ROLES_KEY, roles);
