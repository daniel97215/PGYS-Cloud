import { Injectable, NotFoundException } from "@nestjs/common";
import {
  BusinessPartnerContactRecord,
  BusinessPartnerContactsRepository,
} from "./business-partner-contacts.repository";
import { CreateBusinessPartnerContactDto } from "./dto/create-business-partner-contact.dto";
import { UpdateBusinessPartnerContactDto } from "./dto/update-business-partner-contact.dto";

@Injectable()
export class BusinessPartnerContactsService {
  constructor(
    private readonly businessPartnerContactsRepository: BusinessPartnerContactsRepository,
  ) {}

  createContact(
    workspaceId: string,
    businessPartnerId: string,
    data: CreateBusinessPartnerContactDto,
  ): Promise<BusinessPartnerContactRecord> {
    return this.businessPartnerContactsRepository.create({
      ...data,
      workspaceId,
      businessPartnerId,
    });
  }

  listBusinessPartnerContacts(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<BusinessPartnerContactRecord[]> {
    return this.businessPartnerContactsRepository.findByBusinessPartner(
      workspaceId,
      businessPartnerId,
    );
  }

  async getContact(
    workspaceId: string,
    businessPartnerId: string,
    contactId: string,
  ): Promise<BusinessPartnerContactRecord> {
    return this.requireContact(workspaceId, businessPartnerId, contactId);
  }

  async updateContact(
    workspaceId: string,
    businessPartnerId: string,
    contactId: string,
    data: UpdateBusinessPartnerContactDto,
  ): Promise<BusinessPartnerContactRecord> {
    await this.requireContact(workspaceId, businessPartnerId, contactId);

    return this.businessPartnerContactsRepository.update(
      workspaceId,
      businessPartnerId,
      contactId,
      data,
    );
  }

  async deleteContact(
    workspaceId: string,
    businessPartnerId: string,
    contactId: string,
  ): Promise<BusinessPartnerContactRecord> {
    await this.requireContact(workspaceId, businessPartnerId, contactId);

    return this.businessPartnerContactsRepository.delete(
      workspaceId,
      businessPartnerId,
      contactId,
    );
  }

  private async requireContact(
    workspaceId: string,
    businessPartnerId: string,
    contactId: string,
  ): Promise<BusinessPartnerContactRecord> {
    const contact = await this.businessPartnerContactsRepository.findById(
      workspaceId,
      businessPartnerId,
      contactId,
    );

    if (!contact) {
      throw new NotFoundException(
        `Business partner contact "${contactId}" not found`,
      );
    }

    return contact;
  }
}
