import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type BusinessPartnerDocumentRecord =
  Prisma.BusinessPartnerDocumentGetPayload<object>;

export interface CreateBusinessPartnerDocumentData {
  workspaceId: string;
  businessPartnerId: string;
  name: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
}

export type UpdateBusinessPartnerDocumentData = Omit<
  Partial<CreateBusinessPartnerDocumentData>,
  "workspaceId" | "businessPartnerId"
>;

@Injectable()
export class BusinessPartnerDocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: CreateBusinessPartnerDocumentData,
  ): Promise<BusinessPartnerDocumentRecord> {
    return this.prisma.businessPartnerDocument.create({ data });
  }

  update(
    workspaceId: string,
    businessPartnerId: string,
    documentId: string,
    data: UpdateBusinessPartnerDocumentData,
  ): Promise<BusinessPartnerDocumentRecord> {
    return this.prisma.businessPartnerDocument.update({
      where: {
        id: documentId,
        workspaceId,
        businessPartnerId,
      },
      data,
    });
  }

  delete(
    workspaceId: string,
    businessPartnerId: string,
    documentId: string,
  ): Promise<BusinessPartnerDocumentRecord> {
    return this.prisma.businessPartnerDocument.delete({
      where: {
        id: documentId,
        workspaceId,
        businessPartnerId,
      },
    });
  }

  findByBusinessPartner(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<BusinessPartnerDocumentRecord[]> {
    return this.prisma.businessPartnerDocument.findMany({
      where: { workspaceId, businessPartnerId },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    });
  }

  findById(
    workspaceId: string,
    businessPartnerId: string,
    documentId: string,
  ): Promise<BusinessPartnerDocumentRecord | null> {
    return this.prisma.businessPartnerDocument.findFirst({
      where: {
        id: documentId,
        workspaceId,
        businessPartnerId,
      },
    });
  }
}
