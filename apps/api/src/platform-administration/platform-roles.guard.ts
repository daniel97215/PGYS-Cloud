import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PlatformOperatorRole } from "@prisma/client";
import { PlatformAdministrationRepository } from "./platform-administration.repository";
import { PLATFORM_ROLES_KEY } from "./platform-roles.decorator";

interface PlatformRequest {
  user?: { id?: string };
  platformOperator?: { role: PlatformOperatorRole };
}

@Injectable()
export class PlatformRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly repository: PlatformAdministrationRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<PlatformOperatorRole[]>(
      PLATFORM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const request = context.switchToHttp().getRequest<PlatformRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException("Platform access denied");
    }

    const operator = await this.repository.findActiveOperator(userId);

    if (!operator || (roles?.length && !roles.includes(operator.role))) {
      throw new ForbiddenException("Platform access denied");
    }

    request.platformOperator = { role: operator.role };
    return true;
  }
}
