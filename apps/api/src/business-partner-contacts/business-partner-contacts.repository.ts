import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type BusinessPartnerContactRecord =
  Prisma.BusinessPartnerContactGetPayload<object>;

export interface CreateBusinessPartnerContactData {
  workspaceId: string;
  businessPartnerId: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export type UpdateBusinessPartnerContactData = Omit<
  Partial<CreateBusinessPartnerContactData>,
  "workspaceId" | "businessPartnerId"
>;

@Injectable()
export class BusinessPartnerContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: CreateBusinessPartnerContactData,
  ): Promise<BusinessPartnerContactRecord> {
    return this.prisma.businessPartnerContact.create({ data });
  }

  update(
    workspaceId: string,
    businessPartnerId: string,
    contactId: string,
    data: UpdateBusinessPartnerContactData,
  ): Promise<BusinessPartnerContactRecord> {
    return this.prisma.businessPartnerContact.update({
      where: {
        id: contactId,
        workspaceId,
        businessPartnerId,
      },
      data,
    });
  }

  delete(
    workspaceId: string,
    businessPartnerId: string,
    contactId: string,
  ): Promise<BusinessPartnerContactRecord> {
    return this.prisma.businessPartnerContact.delete({
      where: {
        id: contactId,
        workspaceId,
        businessPartnerId,
      },
    });
  }

  findByBusinessPartner(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<BusinessPartnerContactRecord[]> {
    return this.prisma.businessPartnerContact.findMany({
      where: { workspaceId, businessPartnerId },
      orderBy: [
        { isPrimary: "desc" },
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });
  }

  findById(
    workspaceId: string,
    businessPartnerId: string,
    contactId: string,
  ): Promise<BusinessPartnerContactRecord | null> {
    return this.prisma.businessPartnerContact.findFirst({
      where: {
        id: contactId,
        workspaceId,
        businessPartnerId,
      },
    });
  }
}
