import { PrismaService } from "../../prisma/prisma.service";
import { BusinessPartnerTagsRepository } from "../business-partner-tags.repository";

describe("BusinessPartnerTagsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const tag = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "VIP",
    name: "VIP",
    color: "#1D4ED8",
    isSystem: false,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a business partner tag through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(tag);
    const repository = new BusinessPartnerTagsRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      code: tag.code,
      name: tag.name,
      color: tag.color,
      isSystem: tag.isSystem,
    });

    expect(result).toEqual(tag);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: tag.code,
        name: tag.name,
        color: tag.color,
        isSystem: tag.isSystem,
      },
    });
  });

  it("updates a business partner tag through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(tag);
    const repository = new BusinessPartnerTagsRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, tag.code, {
      name: "Important",
    });

    expect(result).toEqual(tag);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: tag.code,
        },
      },
      data: { name: "Important" },
    });
  });

  it("disables a business partner tag through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...tag,
      isActive: false,
    });
    const repository = new BusinessPartnerTagsRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.disable(workspaceId, tag.code);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: tag.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists business partner tags for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([tag]);
    const repository = new BusinessPartnerTagsRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([tag]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a business partner tag by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(tag);
    const repository = new BusinessPartnerTagsRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      tag.code,
    );

    expect(result).toEqual(tag);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: tag.code,
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
    businessPartnerTag: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
