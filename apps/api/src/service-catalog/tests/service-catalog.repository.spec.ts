import { PrismaService } from "../../prisma/prisma.service";
import {
  SERVICE_CATALOG_STATUS_ARCHIVED,
  ServiceCatalogRepository,
} from "../service-catalog.repository";

describe("ServiceCatalogRepository", () => {
  const catalogItem = {
    id: "10000000-0000-4000-8000-000000000001",
    key: "erp",
    name: "ERP",
    description: "Core ERP service",
    category: "business",
    version: "1.0.0",
    status: "draft",
    configurationSchema: null,
    icon: null,
    visibility: "private",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("lists service catalog items through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([catalogItem]);
    const repository = new ServiceCatalogRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findAll();

    expect(result).toEqual([catalogItem]);
    expect(findMany).toHaveBeenCalledWith({
      orderBy: { key: "asc" },
    });
  });

  it("finds a service catalog item by key through Prisma", async () => {
    const findUnique = jest.fn().mockResolvedValue(catalogItem);
    const repository = new ServiceCatalogRepository(
      createPrismaMock({ findUnique }),
    );

    const result = await repository.findByKey(catalogItem.key);

    expect(result).toEqual(catalogItem);
    expect(findUnique).toHaveBeenCalledWith({
      where: { key: catalogItem.key },
    });
  });

  it("creates a service catalog item through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(catalogItem);
    const repository = new ServiceCatalogRepository(createPrismaMock({ create }));

    const result = await repository.create({
      key: catalogItem.key,
      name: catalogItem.name,
    });

    expect(result).toEqual(catalogItem);
    expect(create).toHaveBeenCalledWith({
      data: {
        key: catalogItem.key,
        name: catalogItem.name,
      },
    });
  });

  it("updates a service catalog item through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(catalogItem);
    const repository = new ServiceCatalogRepository(createPrismaMock({ update }));

    const result = await repository.update(catalogItem.key, {
      name: "ERP Core",
    });

    expect(result).toEqual(catalogItem);
    expect(update).toHaveBeenCalledWith({
      where: { key: catalogItem.key },
      data: { name: "ERP Core" },
    });
  });

  it("archives a service catalog item through Prisma", async () => {
    const update = jest.fn().mockResolvedValue({
      ...catalogItem,
      status: SERVICE_CATALOG_STATUS_ARCHIVED,
    });
    const repository = new ServiceCatalogRepository(createPrismaMock({ update }));

    const result = await repository.archive(catalogItem.key);

    expect(result.status).toBe(SERVICE_CATALOG_STATUS_ARCHIVED);
    expect(update).toHaveBeenCalledWith({
      where: { key: catalogItem.key },
      data: { status: SERVICE_CATALOG_STATUS_ARCHIVED },
    });
  });
});

function createPrismaMock(methods: {
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
  create?: jest.Mock;
  update?: jest.Mock;
}): PrismaService {
  const prisma = {
    serviceCatalogItem: {
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
