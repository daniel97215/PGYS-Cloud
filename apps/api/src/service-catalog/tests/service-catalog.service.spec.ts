import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ServiceCatalogRepository } from "../service-catalog.repository";
import { ServiceCatalogService } from "../service-catalog.service";

describe("ServiceCatalogService", () => {
  let repository: jest.Mocked<ServiceCatalogRepository>;
  let service: ServiceCatalogService;

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

  beforeEach(() => {
    repository = {
      findAll: jest.fn().mockResolvedValue([catalogItem]),
      findByKey: jest.fn().mockResolvedValue(catalogItem),
      create: jest.fn().mockResolvedValue(catalogItem),
      update: jest.fn().mockResolvedValue(catalogItem),
      archive: jest.fn().mockResolvedValue({
        ...catalogItem,
        status: "archived",
      }),
    } as unknown as jest.Mocked<ServiceCatalogRepository>;

    service = new ServiceCatalogService(repository);
  });

  it("lists services", async () => {
    const result = await service.listServices();

    expect(result).toEqual([catalogItem]);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  it("creates a service catalog item", async () => {
    const result = await service.createService({
      key: "ERP",
      name: "ERP",
    });

    expect(result).toEqual(catalogItem);
    expect(repository.create).toHaveBeenCalledWith({
      key: "erp",
      name: "ERP",
    });
  });

  it("finds a service by key", async () => {
    const result = await service.getServiceByKey(catalogItem.key);

    expect(result).toEqual(catalogItem);
    expect(repository.findByKey).toHaveBeenCalledWith(catalogItem.key);
  });

  it("updates a service catalog item", async () => {
    const result = await service.updateService(catalogItem.key, {
      name: "ERP Core",
    });

    expect(result).toEqual(catalogItem);
    expect(repository.update).toHaveBeenCalledWith(catalogItem.key, {
      name: "ERP Core",
    });
  });

  it("archives a service catalog item", async () => {
    const result = await service.archiveService(catalogItem.key);

    expect(result.status).toBe("archived");
    expect(repository.archive).toHaveBeenCalledWith(catalogItem.key);
  });

  it("throws NotFoundException when a key is unknown", async () => {
    repository.findByKey.mockResolvedValueOnce(null);

    await expect(service.getServiceByKey("unknown")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("throws BadRequestException when key is blank", async () => {
    await expect(service.getServiceByKey(" ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
