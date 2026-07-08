import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type BusinessPartnerNoteRecord =
  Prisma.BusinessPartnerNoteGetPayload<object>;

export interface CreateBusinessPartnerNoteData {
  workspaceId: string;
  customerId: string;
  title?: string;
  content: string;
  createdBy?: string;
  updatedBy?: string;
}

export type UpdateBusinessPartnerNoteData = Omit<
  Partial<CreateBusinessPartnerNoteData>,
  "workspaceId" | "customerId" | "createdBy"
>;

@Injectable()
export class BusinessPartnerNotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBusinessPartnerNoteData): Promise<BusinessPartnerNoteRecord> {
    return this.prisma.businessPartnerNote.create({ data });
  }

  update(
    workspaceId: string,
    customerId: string,
    noteId: string,
    data: UpdateBusinessPartnerNoteData,
  ): Promise<BusinessPartnerNoteRecord> {
    return this.prisma.businessPartnerNote.update({
      where: {
        id: noteId,
        workspaceId,
        customerId,
      },
      data,
    });
  }

  delete(
    workspaceId: string,
    customerId: string,
    noteId: string,
  ): Promise<BusinessPartnerNoteRecord> {
    return this.prisma.businessPartnerNote.delete({
      where: {
        id: noteId,
        workspaceId,
        customerId,
      },
    });
  }

  findByCustomer(
    workspaceId: string,
    customerId: string,
  ): Promise<BusinessPartnerNoteRecord[]> {
    return this.prisma.businessPartnerNote.findMany({
      where: { workspaceId, customerId },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  findById(
    workspaceId: string,
    customerId: string,
    noteId: string,
  ): Promise<BusinessPartnerNoteRecord | null> {
    return this.prisma.businessPartnerNote.findFirst({
      where: {
        id: noteId,
        workspaceId,
        customerId,
      },
    });
  }
}
