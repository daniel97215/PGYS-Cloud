import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CustomerStatus } from "./enums/customer-status.enum";
import { CustomerType } from "./enums/customer-type.enum";

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
