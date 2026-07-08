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
    customerId: string,
    data: CreateBusinessPartnerAddressDto,
  ): Promise<BusinessPartnerAddressRecord> {
    return this.businessPartnerAddressesRepository.create({
      ...data,
      workspaceId,
      customerId,
    });
  }

  listCustomerAddresses(
    workspaceId: string,
    customerId: string,
  ): Promise<BusinessPartnerAddressRecord[]> {
    return this.businessPartnerAddressesRepository.findByCustomer(
      workspaceId,
      customerId,
    );
  }

  async getAddress(
    workspaceId: string,
    customerId: string,
    addressId: string,
  ): Promise<BusinessPartnerAddressRecord> {
    return this.requireAddress(workspaceId, customerId, addressId);
  }

  async updateAddress(
    workspaceId: string,
    customerId: string,
    addressId: string,
    data: UpdateBusinessPartnerAddressDto,
  ): Promise<BusinessPartnerAddressRecord> {
    await this.requireAddress(workspaceId, customerId, addressId);

    return this.businessPartnerAddressesRepository.update(
      workspaceId,
      customerId,
      addressId,
      data,
    );
  }

  async deleteAddress(
    workspaceId: string,
    customerId: string,
    addressId: string,
  ): Promise<BusinessPartnerAddressRecord> {
    await this.requireAddress(workspaceId, customerId, addressId);

    return this.businessPartnerAddressesRepository.delete(
      workspaceId,
      customerId,
      addressId,
    );
  }

  private async requireAddress(
    workspaceId: string,
    customerId: string,
    addressId: string,
  ): Promise<BusinessPartnerAddressRecord> {
    const address = await this.businessPartnerAddressesRepository.findById(
      workspaceId,
      customerId,
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
