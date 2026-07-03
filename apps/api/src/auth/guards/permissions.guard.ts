import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "../constants/permissions.constants";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

interface RequestWithUserPermissions {
  user?: {
    permissions?: Permission[];
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest<RequestWithUserPermissions>();
    const userPermissions = request.user?.permissions ?? [];

    if (userPermissions.length === 0) {
      return true;
    }

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}

