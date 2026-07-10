import { PrismaService } from "../../prisma/prisma.service";
import { ManufacturersRepository } from "../manufacturers.repository";

describe("ManufacturersRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const manufacturer = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "ACME-MFG",
    name: "Acme Manufacturing",
    description: "Acme product manufacturer",
    websiteUrl: "https://example.com",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a manufacturer through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(manufacturer);
    const repository = new ManufacturersRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      code: manufacturer.code,
      name: manufacturer.name,
      description: manufacturer.description,
      websiteUrl: manufacturer.websiteUrl,
    });

    expect(result).toEqual(manufacturer);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        code: manufacturer.code,
        name: manufacturer.name,
        description: manufacturer.description,
        websiteUrl: manufacturer.websiteUrl,
      },
    });
  });

  it("updates a manufacturer through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(manufacturer);
    const repository = new ManufacturersRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, manufacturer.code, {
      name: "Acme Manufacturing Pro",
    });

    expect(result).toEqual(manufacturer);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: manufacturer.code,
        },
      },
      data: { name: "Acme Manufacturing Pro" },
    });
  });

  it("deactivates a manufacturer through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...manufacturer,
      isActive: false,
    });
    const repository = new ManufacturersRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.deactivate(workspaceId, manufacturer.code);

    expect(result.isActive).toBe(false);
    expect(update).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: manufacturer.code,
        },
      },
      data: { isActive: false },
    });
  });

  it("lists manufacturers for a workspace through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([manufacturer]);
    const repository = new ManufacturersRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByWorkspace(workspaceId);

    expect(result).toEqual([manufacturer]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds a manufacturer by workspace and code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(manufacturer);
    const repository = new ManufacturersRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByWorkspaceAndCode(
      workspaceId,
      manufacturer.code,
    );

    expect(result).toEqual(manufacturer);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: {
          workspaceId,
          code: manufacturer.code,
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
    manufacturer: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
