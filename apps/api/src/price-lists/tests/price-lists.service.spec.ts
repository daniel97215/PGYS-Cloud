import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PriceListsRepository } from "../price-lists.repository";
import { PriceListsService } from "../price-lists.service";

describe("PriceListsService", () => {
  let repository: jest.Mocked<PriceListsRepository>;
  let service: PriceListsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const priceList = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "PUBLIC",
    name: "Public price list",
    description: "Default public prices",
    currencyCode: "EUR",
    isDefault: true,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(priceList),
      update: jest.fn().mockResolvedValue(priceList),
      deactivate: jest.fn().mockResolvedValue({ ...priceList, isActive: false }),
      findByWorkspace: jest.fn().mockResolvedValue([priceList]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(priceList),
    } as unknown as jest.Mocked<PriceListsRepository>;

    service = new PriceListsService(repository);
  });

  it("creates a price list", async () => {
    const result = await service.create(workspaceId, {
      code: "public",
      name: priceList.name,
      description: priceList.description,
      currencyCode: "eur",
      isDefault: priceList.isDefault,
    });

    expect(result).toEqual(priceList);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: priceList.code,
      name: priceList.name,
      description: priceList.description,
      currencyCode: priceList.currencyCode,
      isDefault: priceList.isDefault,
    });
  });

  it("updates a price list", async () => {
    const result = await service.update(workspaceId, priceList.code, {
      name: "Updated price list",
      currencyCode: "usd",
    });

    expect(result).toEqual(priceList);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      priceList.code,
    );
    expect(repository.update).toHaveBeenCalledWith(workspaceId, priceList.code, {
      name: "Updated price list",
      currencyCode: "USD",
    });
  });

  it("lists price lists", async () => {
    const result = await service.list(workspaceId);

    expect(result).toEqual([priceList]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a price list by code", async () => {
    const result = await service.getByCode(workspaceId, priceList.code);

    expect(result).toEqual(priceList);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      priceList.code,
    );
  });

  it("deactivates a price list", async () => {
    const result = await service.deactivate(workspaceId, priceList.code);

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(
      workspaceId,
      priceList.code,
    );
  });

  it("throws NotFoundException when price list is unknown", async () => {
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

  it("throws BadRequestException when currency code is invalid", () => {
    expect(() =>
      service.create(workspaceId, {
        code: priceList.code,
        name: priceList.name,
        currencyCode: "EURO",
      }),
    ).toThrow(BadRequestException);
  });
});
