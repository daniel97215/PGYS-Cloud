import { PrismaService } from "../../prisma/prisma.service";
import { BusinessPartnerRolesRepository } from "../business-partner-roles.repository";

describe("BusinessPartnerRolesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const role = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "CUSTOMER",
    name: "Customer",
    description: "Customer role",
    isSystem: true,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a business partner role through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(role);
    const repository = new BusinessPartnerRolesRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      code: role.code,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
    });

    expect(result).toEqual(role);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: role.code,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
      },
    });
  });

  it("updates a business partner role through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(role);
    const repository = new BusinessPartnerRolesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, role.code, {
      name: "Prospect",
    });

    expect(result).toEqual(role);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: role.code,
        },
      },
      data: { name: "Prospect" },
    });
  });

  it("disables a business partner role through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...role,
      isActive: false,
    });
    const repository = new BusinessPartnerRolesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.disable(workspaceId, role.code);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: role.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists business partner roles for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([role]);
    const repository = new BusinessPartnerRolesRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([role]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a business partner role by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(role);
    const repository = new BusinessPartnerRolesRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      role.code,
    );

    expect(result).toEqual(role);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: role.code,
        },
      },
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  update?: jest.Mock;
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
}): PrismaService {
  const prisma = {
    businessPartnerRole: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
