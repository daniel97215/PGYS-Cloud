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
    customerId: string,
    data: CreateBusinessPartnerDocumentDto,
  ): Promise<BusinessPartnerDocumentRecord> {
    return this.businessPartnerDocumentsRepository.create({
      ...data,
      workspaceId,
      customerId,
    });
  }

  listCustomerDocuments(
    workspaceId: string,
    customerId: string,
  ): Promise<BusinessPartnerDocumentRecord[]> {
    return this.businessPartnerDocumentsRepository.findByCustomer(
      workspaceId,
      customerId,
    );
  }

  async getDocument(
    workspaceId: string,
    customerId: string,
    documentId: string,
  ): Promise<BusinessPartnerDocumentRecord> {
    return this.requireDocument(workspaceId, customerId, documentId);
  }

  async updateDocument(
    workspaceId: string,
    customerId: string,
    documentId: string,
    data: UpdateBusinessPartnerDocumentDto,
  ): Promise<BusinessPartnerDocumentRecord> {
    await this.requireDocument(workspaceId, customerId, documentId);

    return this.businessPartnerDocumentsRepository.update(
      workspaceId,
      customerId,
      documentId,
      data,
    );
  }

  async deleteDocument(
    workspaceId: string,
    customerId: string,
    documentId: string,
  ): Promise<BusinessPartnerDocumentRecord> {
    await this.requireDocument(workspaceId, customerId, documentId);

    return this.businessPartnerDocumentsRepository.delete(
      workspaceId,
      customerId,
      documentId,
    );
  }

  private async requireDocument(
    workspaceId: string,
    customerId: string,
    documentId: string,
  ): Promise<BusinessPartnerDocumentRecord> {
    const document = await this.businessPartnerDocumentsRepository.findById(
      workspaceId,
      customerId,
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
