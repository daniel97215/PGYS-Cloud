import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PlatformOperatorRole } from "@prisma/client";
import { PlatformAdministrationRepository } from "../platform-administration.repository";
import { PlatformRolesGuard } from "../platform-roles.guard";

describe("PlatformRolesGuard", () => {
  const contextFor = (request: object) =>
    ({
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    }) as unknown as ExecutionContext;

  it("denies workspace-only users", async () => {
    const repository = {
      findActiveOperator: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<PlatformAdministrationRepository>;
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue([PlatformOperatorRole.PLATFORM_ADMIN]),
    } as unknown as Reflector;
    const guard = new PlatformRolesGuard(reflector, repository);

    await expect(
      guard.canActivate(contextFor({ user: { id: "user-1" } })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("attaches an authorized support operator to the request", async () => {
    const repository = {
      findActiveOperator: jest.fn().mockResolvedValue({
        role: PlatformOperatorRole.PLATFORM_SUPPORT,
      }),
    } as unknown as jest.Mocked<PlatformAdministrationRepository>;
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue([PlatformOperatorRole.PLATFORM_SUPPORT]),
    } as unknown as Reflector;
    const guard = new PlatformRolesGuard(reflector, repository);
    const request: {
      user: { id: string };
      platformOperator?: { role: PlatformOperatorRole };
    } = { user: { id: "user-1" } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.platformOperator).toEqual({
      role: PlatformOperatorRole.PLATFORM_SUPPORT,
    });
  });
});
