import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  CUSTOMER_STATUS_ARCHIVED,
  CustomersRepository,
} from "../customers.repository";
import { CustomersService } from "../customers.service";

describe("CustomersService", () => {
  let repository: jest.Mocked<CustomersRepository>;
  let service: CustomersService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const customer = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "CUST-001",
    type: "customer",
    name: "ACME France",
    legalName: "ACME France SAS",
    status: "active",
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
        status: CUSTOMER_STATUS_ARCHIVED,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([customer]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(customer),
    } as unknown as jest.Mocked<CustomersRepository>;

    service = new CustomersService(repository);
  });

  it("creates a customer", async () => {
    const result = await service.createCustomer(workspaceId, {
      code: "cust-001",
      type: "customer",
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
    const result = await service.listWorkspaceCustomers(workspaceId);

    expect(result).toEqual([customer]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a customer by code", async () => {
    const result = await service.getCustomer(workspaceId, "cust-001");

    expect(result).toEqual(customer);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      customer.code,
    );
  });

  it("updates a customer", async () => {
    const result = await service.updateCustomer(workspaceId, customer.code, {
      name: "ACME Europe",
      status: "inactive",
    });

    expect(result).toEqual(customer);
    expect(repository.update).toHaveBeenCalledWith(workspaceId, customer.code, {
      name: "ACME Europe",
      status: "inactive",
      type: undefined,
    });
  });

  it("archives a customer", async () => {
    const result = await service.archiveCustomer(workspaceId, customer.code);

    expect(result.status).toBe(CUSTOMER_STATUS_ARCHIVED);
    expect(repository.archive).toHaveBeenCalledWith(workspaceId, customer.code);
  });

  it("throws NotFoundException when customer is unknown", async () => {
    repository.findByWorkspaceAndCode.mockResolvedValueOnce(null);

    await expect(
      service.getCustomer(workspaceId, "unknown"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when code is blank", async () => {
    await expect(service.getCustomer(workspaceId, " ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
