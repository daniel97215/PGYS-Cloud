import { Injectable, NotFoundException } from "@nestjs/common";
import {
  BusinessPartnerAddressRecord,
  BusinessPartnerAddressesRepository,
} from "./business-partner-addresses.repository";
import { CreateBusinessPartnerAddressDto } from "./dto/create-business-partner-address.dto";
import { UpdateBusinessPartnerAddressDto } from "./dto/update-business-partner-address.dto";

@Injectable()
export class BusinessPartnerAddressesService {
  constructor(
    private readonly businessPartnerAddressesRepository: BusinessPartnerAddressesRepository,
  ) {}

  createAddress(
    workspaceId: string,
    businessPartnerId: string,
    data: CreateBusinessPartnerAddressDto,
  ): Promise<BusinessPartnerAddressRecord> {
    return this.businessPartnerAddressesRepository.create({
      ...data,
      workspaceId,
      businessPartnerId,
    });
  }

  listBusinessPartnerAddresses(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<BusinessPartnerAddressRecord[]> {
    return this.businessPartnerAddressesRepository.findByBusinessPartner(
      workspaceId,
      businessPartnerId,
    );
  }

  async getAddress(
    workspaceId: string,
    businessPartnerId: string,
    addressId: string,
  ): Promise<BusinessPartnerAddressRecord> {
    return this.requireAddress(workspaceId, businessPartnerId, addressId);
  }

  async updateAddress(
    workspaceId: string,
    businessPartnerId: string,
    addressId: string,
    data: UpdateBusinessPartnerAddressDto,
  ): Promise<BusinessPartnerAddressRecord> {
    await this.requireAddress(workspaceId, businessPartnerId, addressId);

    return this.businessPartnerAddressesRepository.update(
      workspaceId,
      businessPartnerId,
      addressId,
      data,
    );
  }

  async deleteAddress(
    workspaceId: string,
    businessPartnerId: string,
    addressId: string,
  ): Promise<BusinessPartnerAddressRecord> {
    await this.requireAddress(workspaceId, businessPartnerId, addressId);

    return this.businessPartnerAddressesRepository.delete(
      workspaceId,
      businessPartnerId,
      addressId,
    );
  }

  private async requireAddress(
    workspaceId: string,
    businessPartnerId: string,
    addressId: string,
  ): Promise<BusinessPartnerAddressRecord> {
    const address = await this.businessPartnerAddressesRepository.findById(
      workspaceId,
      businessPartnerId,
      addressId,
    );

    if (!address) {
      throw new NotFoundException(
        `Business partner address "${addressId}" not found`,
      );
    }

    return address;
  }
}
