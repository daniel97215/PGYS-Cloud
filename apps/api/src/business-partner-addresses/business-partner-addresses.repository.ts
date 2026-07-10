import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type BusinessPartnerAddressRecord =
  Prisma.BusinessPartnerAddressGetPayload<object>;

export interface CreateBusinessPartnerAddressData {
  workspaceId: string;
  businessPartnerId: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  state?: string;
  countryCode: string;
  isDefault?: boolean;
}

export type UpdateBusinessPartnerAddressData = Omit<
  Partial<CreateBusinessPartnerAddressData>,
  "workspaceId" | "businessPartnerId"
>;

@Injectable()
export class BusinessPartnerAddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: CreateBusinessPartnerAddressData,
  ): Promise<BusinessPartnerAddressRecord> {
    return this.prisma.businessPartnerAddress.create({ data });
  }

  update(
    workspaceId: string,
    businessPartnerId: string,
    addressId: string,
    data: UpdateBusinessPartnerAddressData,
  ): Promise<BusinessPartnerAddressRecord> {
    return this.prisma.businessPartnerAddress.update({
      where: {
        id: addressId,
        workspaceId,
        businessPartnerId,
      },
      data,
    });
  }

  delete(
    workspaceId: string,
    businessPartnerId: string,
    addressId: string,
  ): Promise<BusinessPartnerAddressRecord> {
    return this.prisma.businessPartnerAddress.delete({
      where: {
        id: addressId,
        workspaceId,
        businessPartnerId,
      },
    });
  }

  findByBusinessPartner(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<BusinessPartnerAddressRecord[]> {
    return this.prisma.businessPartnerAddress.findMany({
      where: { workspaceId, businessPartnerId },
      orderBy: [{ isDefault: "desc" }, { label: "asc" }, { createdAt: "asc" }],
    });
  }

  findById(
    workspaceId: string,
    businessPartnerId: string,
    addressId: string,
  ): Promise<BusinessPartnerAddressRecord | null> {
    return this.prisma.businessPartnerAddress.findFirst({
      where: {
        id: addressId,
        workspaceId,
        businessPartnerId,
      },
    });
  }
}
