import { Injectable, NotFoundException } from "@nestjs/common";
import {
  BusinessPartnerDocumentRecord,
  BusinessPartnerDocumentsRepository,
} from "./business-partner-documents.repository";
import { CreateBusinessPartnerDocumentDto } from "./dto/create-business-partner-document.dto";
import { UpdateBusinessPartnerDocumentDto } from "./dto/update-business-partner-document.dto";

@Injectable()
export class BusinessPartnerDocumentsService {
  constructor(
    private readonly businessPartnerDocumentsRepository: BusinessPartnerDocumentsRepository,
  ) {}

  createDocument(
    workspaceId: string,
    businessPartnerId: string,
    data: CreateBusinessPartnerDocumentDto,
  ): Promise<BusinessPartnerDocumentRecord> {
    return this.businessPartnerDocumentsRepository.create({
      ...data,
      workspaceId,
      businessPartnerId,
    });
  }

  listBusinessPartnerDocuments(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<BusinessPartnerDocumentRecord[]> {
    return this.businessPartnerDocumentsRepository.findByBusinessPartner(
      workspaceId,
      businessPartnerId,
    );
  }

  async getDocument(
    workspaceId: string,
    businessPartnerId: string,
    documentId: string,
  ): Promise<BusinessPartnerDocumentRecord> {
    return this.requireDocument(workspaceId, businessPartnerId, documentId);
  }

  async updateDocument(
    workspaceId: string,
    businessPartnerId: string,
    documentId: string,
    data: UpdateBusinessPartnerDocumentDto,
  ): Promise<BusinessPartnerDocumentRecord> {
    await this.requireDocument(workspaceId, businessPartnerId, documentId);

    return this.businessPartnerDocumentsRepository.update(
      workspaceId,
      businessPartnerId,
      documentId,
      data,
    );
  }

  async deleteDocument(
    workspaceId: string,
    businessPartnerId: string,
    documentId: string,
  ): Promise<BusinessPartnerDocumentRecord> {
    await this.requireDocument(workspaceId, businessPartnerId, documentId);

    return this.businessPartnerDocumentsRepository.delete(
      workspaceId,
      businessPartnerId,
      documentId,
    );
  }

  private async requireDocument(
    workspaceId: string,
    businessPartnerId: string,
    documentId: string,
  ): Promise<BusinessPartnerDocumentRecord> {
    const document = await this.businessPartnerDocumentsRepository.findById(
      workspaceId,
      businessPartnerId,
      documentId,
    );

    if (!document) {
      throw new NotFoundException(
        `Business partner document "${documentId}" not found`,
      );
    }

    return document;
  }
}
