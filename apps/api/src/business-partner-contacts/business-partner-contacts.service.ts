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
    customerId: string,
    data: CreateBusinessPartnerContactDto,
  ): Promise<BusinessPartnerContactRecord> {
    return this.businessPartnerContactsRepository.create({
      ...data,
      workspaceId,
      customerId,
    });
  }

  listCustomerContacts(
    workspaceId: string,
    customerId: string,
  ): Promise<BusinessPartnerContactRecord[]> {
    return this.businessPartnerContactsRepository.findByCustomer(
      workspaceId,
      customerId,
    );
  }

  async getContact(
    workspaceId: string,
    customerId: string,
    contactId: string,
  ): Promise<BusinessPartnerContactRecord> {
    return this.requireContact(workspaceId, customerId, contactId);
  }

  async updateContact(
    workspaceId: string,
    customerId: string,
    contactId: string,
    data: UpdateBusinessPartnerContactDto,
  ): Promise<BusinessPartnerContactRecord> {
    await this.requireContact(workspaceId, customerId, contactId);

    return this.businessPartnerContactsRepository.update(
      workspaceId,
      customerId,
      contactId,
      data,
    );
  }

  async deleteContact(
    workspaceId: string,
    customerId: string,
    contactId: string,
  ): Promise<BusinessPartnerContactRecord> {
    await this.requireContact(workspaceId, customerId, contactId);

    return this.businessPartnerContactsRepository.delete(
      workspaceId,
      customerId,
      contactId,
    );
  }

  private async requireContact(
    workspaceId: string,
    customerId: string,
    contactId: string,
  ): Promise<BusinessPartnerContactRecord> {
    const contact = await this.businessPartnerContactsRepository.findById(
      workspaceId,
      customerId,
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
