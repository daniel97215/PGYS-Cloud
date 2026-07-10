import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { TaxesRepository } from "../taxes.repository";
import { TaxesService } from "../taxes.service";

describe("TaxesService", () => {
  let repository: jest.Mocked<TaxesRepository>;
  let service: TaxesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const tax = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "VAT20",
    name: "VAT 20%",
    rate: new Prisma.Decimal(20),
    isDefault: false,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(tax),
      update: jest.fn().mockResolvedValue(tax),
      deactivate: jest.fn().mockResolvedValue({
        ...tax,
        isActive: false,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([tax]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(tax),
    } as unknown as jest.Mocked<TaxesRepository>;

    service = new TaxesService(repository);
  });

  it("creates a tax", async () => {
    const result = await service.create(workspaceId, {
      code: "vat20",
      name: tax.name,
      rate: 20,
    });

    expect(result).toEqual(tax);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: tax.code,
      name: tax.name,
      rate: 20,
    });
  });

  it("updates a tax", async () => {
    const result = await service.update(workspaceId, tax.code, {
      name: "Standard VAT",
    });

    expect(result).toEqual(tax);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      tax.code,
    );
    expect(repository.update).toHaveBeenCalledWith(workspaceId, tax.code, {
      name: "Standard VAT",
    });
  });

  it("lists taxes", async () => {
    const result = await service.list(workspaceId);

    expect(result).toEqual([tax]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a tax by code", async () => {
    const result = await service.getByCode(workspaceId, tax.code);

    expect(result).toEqual(tax);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      tax.code,
    );
  });

  it("deactivates a tax", async () => {
    const result = await service.deactivate(workspaceId, tax.code);

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(workspaceId, tax.code);
  });

  it("throws NotFoundException when tax is unknown", async () => {
    repository.findByWorkspaceAndCode.mockResolvedValueOnce(null);

    await expect(
      service.getByCode(workspaceId, "unknown"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when code is blank", async () => {
    await expect(service.getByCode(workspaceId, " ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
