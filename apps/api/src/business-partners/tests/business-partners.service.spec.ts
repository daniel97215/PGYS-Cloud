import { BadRequestException, NotFoundException } from "@nestjs/common";
import { BusinessPartnersRepository } from "../business-partners.repository";
import { BusinessPartnersService } from "../business-partners.service";
import { BusinessPartnerStatus } from "../enums/business-partner-status.enum";
import { BusinessPartnerType } from "../enums/business-partner-type.enum";

describe("BusinessPartnersService", () => {
  let repository: jest.Mocked<BusinessPartnersRepository>;
  let service: BusinessPartnersService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const customer = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "CUST-001",
    type: BusinessPartnerType.CUSTOMER,
    name: "ACME France",
    legalName: "ACME France SAS",
    status: BusinessPartnerStatus.ACTIVE,
    notes: "Strategic customer",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(customer),
      update: jest.fn().mockResolvedValue(customer),
      archive: jest.fn().mockResolvedValue({
        ...customer,
        status: BusinessPartnerStatus.ARCHIVED,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([customer]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(customer),
    } as unknown as jest.Mocked<BusinessPartnersRepository>;

    service = new BusinessPartnersService(repository);
  });

  it("creates a customer", async () => {
    const result = await service.createBusinessPartner(workspaceId, {
      code: "cust-001",
      type: BusinessPartnerType.CUSTOMER,
      name: customer.name,
      legalName: customer.legalName,
      notes: customer.notes,
    });

    expect(result).toEqual(customer);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: customer.code,
      type: customer.type,
      name: customer.name,
      legalName: customer.legalName,
      notes: customer.notes,
      status: undefined,
    });
  });

  it("lists workspace customers", async () => {
    const result = await service.listWorkspaceBusinessPartners(workspaceId);

    expect(result).toEqual([customer]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a customer by code", async () => {
    const result = await service.getBusinessPartner(workspaceId, "cust-001");

    expect(result).toEqual(customer);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      customer.code,
    );
  });

  it("updates a customer", async () => {
    const result = await service.updateBusinessPartner(workspaceId, customer.code, {
      name: "ACME Europe",
      status: BusinessPartnerStatus.INACTIVE,
    });

    expect(result).toEqual(customer);
    expect(repository.update).toHaveBeenCalledWith(workspaceId, customer.code, {
      name: "ACME Europe",
      status: BusinessPartnerStatus.INACTIVE,
      type: undefined,
    });
  });

  it("archives a customer", async () => {
    const result = await service.archiveBusinessPartner(workspaceId, customer.code);

    expect(result.status).toBe(BusinessPartnerStatus.ARCHIVED);
    expect(repository.archive).toHaveBeenCalledWith(workspaceId, customer.code);
  });

  it("throws NotFoundException when customer is unknown", async () => {
    repository.findByWorkspaceAndCode.mockResolvedValueOnce(null);

    await expect(
      service.getBusinessPartner(workspaceId, "unknown"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when code is blank", async () => {
    await expect(service.getBusinessPartner(workspaceId, " ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
