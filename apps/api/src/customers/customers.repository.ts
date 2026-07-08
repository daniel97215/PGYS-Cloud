import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CustomerStatus } from "./enums/customer-status.enum";

export const CUSTOMER_TYPE_CUSTOMER = "customer";
export const CUSTOMER_TYPE_PROSPECT = "prospect";
export const CUSTOMER_TYPE_PARTNER = "partner";
export const CUSTOMER_TYPE_SUPPLIER = "supplier";
export const CUSTOMER_TYPES = [
  CUSTOMER_TYPE_CUSTOMER,
  CUSTOMER_TYPE_PROSPECT,
  CUSTOMER_TYPE_PARTNER,
  CUSTOMER_TYPE_SUPPLIER,
] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number];
export type CustomerRecord = Prisma.CustomerGetPayload<object>;

export interface CreateCustomerData {
  workspaceId: string;
  code: string;
  type: CustomerType;
  name: string;
  legalName?: string;
  status?: CustomerStatus;
  notes?: string;
}

export interface UpdateCustomerData {
  type?: CustomerType;
  name?: string;
  legalName?: string;
  status?: CustomerStatus;
  notes?: string;
}

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCustomerData): Promise<CustomerRecord> {
    return this.prisma.customer.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateCustomerData,
  ): Promise<CustomerRecord> {
    return this.prisma.customer.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  archive(workspaceId: string, code: string): Promise<CustomerRecord> {
    return this.prisma.customer.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { status: CustomerStatus.ARCHIVED },
    });
  }

  findByWorkspace(workspaceId: string): Promise<CustomerRecord[]> {
    return this.prisma.customer.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<CustomerRecord | null> {
    return this.prisma.customer.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
