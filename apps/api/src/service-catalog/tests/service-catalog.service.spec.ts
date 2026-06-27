import { NotFoundException } from "@nestjs/common";
import { ServiceCatalogRepository } from "../service-catalog.repository";
import { ServiceCatalogService } from "../service-catalog.service";

describe("ServiceCatalogService", () => {
  let repository: jest.Mocked<ServiceCatalogRepository>;
  let service: ServiceCatalogService;

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

  beforeEach(() => {
    repository = {
      findAllActive: jest.fn().mockResolvedValue([serviceDefinition]),
      findByCode: jest.fn().mockResolvedValue(serviceDefinition),
    } as unknown as jest.Mocked<ServiceCatalogRepository>;
    service = new ServiceCatalogService(repository);
  });

  it("lists active services", async () => {
    const result = await service.listActiveServices();

    expect(result).toEqual([serviceDefinition]);
    expect(repository.findAllActive).toHaveBeenCalledWith();
  });

  it("finds a service by code", async () => {
    const result = await service.getServiceByCode(serviceDefinition.code);

    expect(result).toEqual(serviceDefinition);
    expect(repository.findByCode).toHaveBeenCalledWith(serviceDefinition.code);
  });

  it("throws NotFoundException when a code is unknown", async () => {
    repository.findByCode.mockResolvedValueOnce(null);

    await expect(service.getServiceByCode("unknown")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
