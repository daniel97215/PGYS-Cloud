import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateBusinessPartnerDto } from "./dto/create-business-partner.dto";
import { UpdateBusinessPartnerDto } from "./dto/update-business-partner.dto";
import {
  BusinessPartnerRecord,
  BusinessPartnersRepository,
} from "./business-partners.repository";
import { BusinessPartnerStatus } from "./enums/business-partner-status.enum";
import { BusinessPartnerType } from "./enums/business-partner-type.enum";

@Injectable()
export class BusinessPartnersService {
  constructor(private readonly businessPartnersRepository: BusinessPartnersRepository) {}

  createBusinessPartner(
    workspaceId: string,
    data: CreateBusinessPartnerDto,
  ): Promise<BusinessPartnerRecord> {
    return this.businessPartnersRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
      type: data.type as BusinessPartnerType,
      status: data.status as BusinessPartnerStatus | undefined,
    });
  }

  listWorkspaceBusinessPartners(workspaceId: string): Promise<BusinessPartnerRecord[]> {
    return this.businessPartnersRepository.findByWorkspace(workspaceId);
  }

  async getBusinessPartner(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerRecord> {
    return this.requireBusinessPartner(workspaceId, code);
  }

  async updateBusinessPartner(
    workspaceId: string,
    code: string,
    data: UpdateBusinessPartnerDto,
  ): Promise<BusinessPartnerRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireBusinessPartner(workspaceId, normalizedCode);

    return this.businessPartnersRepository.update(workspaceId, normalizedCode, {
      ...data,
      type: data.type as BusinessPartnerType | undefined,
      status: data.status as BusinessPartnerStatus | undefined,
    });
  }

  async archiveBusinessPartner(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireBusinessPartner(workspaceId, normalizedCode);

    return this.businessPartnersRepository.archive(workspaceId, normalizedCode);
  }

  private async requireBusinessPartner(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerRecord> {
    const normalizedCode = this.normalizeCode(code);
    const customer = await this.businessPartnersRepository.findByWorkspaceAndCode(
      workspaceId,
      normalizedCode,
    );

    if (!customer) {
      throw new NotFoundException(`Customer "${code}" not found`);
    }

    return customer;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Customer code is required");
    }

    return normalizedCode;
  }
}
