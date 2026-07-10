import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UnitsRepository } from "../units.repository";
import { UnitsService } from "../units.service";

describe("UnitsService", () => {
  let repository: jest.Mocked<UnitsRepository>;
  let service: UnitsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const unit = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "PIECE",
    name: "Piece",
    symbol: "pc",
    description: "Single item unit",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(unit),
      update: jest.fn().mockResolvedValue(unit),
      deactivate: jest.fn().mockResolvedValue({
        ...unit,
        isActive: false,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([unit]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(unit),
    } as unknown as jest.Mocked<UnitsRepository>;

    service = new UnitsService(repository);
  });

  it("creates a unit", async () => {
    const result = await service.create(workspaceId, {
      code: "piece",
      name: unit.name,
      symbol: unit.symbol,
      description: unit.description,
    });

    expect(result).toEqual(unit);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: unit.code,
      name: unit.name,
      symbol: unit.symbol,
      description: unit.description,
    });
  });

  it("updates a unit", async () => {
    const result = await service.update(workspaceId, unit.code, {
      name: "Unit piece",
    });

    expect(result).toEqual(unit);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      unit.code,
    );
    expect(repository.update).toHaveBeenCalledWith(workspaceId, unit.code, {
      name: "Unit piece",
    });
  });

  it("lists units", async () => {
    const result = await service.list(workspaceId);

    expect(result).toEqual([unit]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a unit by code", async () => {
    const result = await service.getByCode(workspaceId, unit.code);

    expect(result).toEqual(unit);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      unit.code,
    );
  });

  it("deactivates a unit", async () => {
    const result = await service.deactivate(workspaceId, unit.code);

    expect(result.isActive).toBe(false);
    expect(repository.deactivate).toHaveBeenCalledWith(workspaceId, unit.code);
  });

  it("throws NotFoundException when unit is unknown", async () => {
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
