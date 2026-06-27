import { PrismaService } from "../../prisma/prisma.service";
import { ServiceCatalogRepository } from "../service-catalog.repository";

describe("ServiceCatalogRepository", () => {
  const serviceDefinition = {
    id: "10000000-0000-4000-8000-000000000001",
    code: "pgys-cloud",
    name: "PGYS Cloud",
    description: "Cloud storage service",
    version: "1.0.0",
    isActive: true,
    configSchema: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("lists active service definitions through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([serviceDefinition]);
    const repository = new ServiceCatalogRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findAllActive();

    expect(result).toEqual([serviceDefinition]);
    expect(findMany).toHaveBeenCalledWith({
      where: { isActive: true },
    });
  });

  it("finds a service definition by code through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(serviceDefinition);
    const repository = new ServiceCatalogRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByCode(serviceDefinition.code);

    expect(result).toEqual(serviceDefinition);
    expect(findUnique).toHaveBeenCalledWith({
      where: { code: serviceDefinition.code },
    });
  });
});

function createPrismaMock(methods: {
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
}): PrismaService {
  const prisma = {
    serviceDefinition: {
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
