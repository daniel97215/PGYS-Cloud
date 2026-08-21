import { applyDecorators, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { PlatformOperatorRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PlatformRoles } from "./platform-roles.decorator";
import { PlatformRolesGuard } from "./platform-roles.guard";

export const PlatformOperatorReadAccess = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: "Access token missing or invalid" }),
    ApiForbiddenResponse({ description: "Platform operator access required" }),
    UseGuards(JwtAuthGuard, PlatformRolesGuard),
    PlatformRoles(
      PlatformOperatorRole.PLATFORM_ADMIN,
      PlatformOperatorRole.PLATFORM_SUPPORT,
    ),
  );

export const PlatformAdminOnly = () =>
  PlatformRoles(PlatformOperatorRole.PLATFORM_ADMIN);
