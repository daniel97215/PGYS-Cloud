import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { SystemRole } from "../constants/roles.constants";

interface RequestWithUserRoles {
  user?: {
    roles?: SystemRole[];
    role?: SystemRole;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUserRoles>();
    const userRoles = this.getUserRoles(request);

    if (userRoles.length === 0) {
      return true;
    }

    return requiredRoles.some((role) => userRoles.includes(role));
  }

  private getUserRoles(request: RequestWithUserRoles): SystemRole[] {
    const roles = request.user?.roles ?? [];
    const role = request.user?.role;

    return role ? [...roles, role] : roles;
  }
}

