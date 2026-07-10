import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BusinessPartnerTagRecord,
  BusinessPartnerTagsRepository,
} from "./business-partner-tags.repository";
import { CreateBusinessPartnerTagDto } from "./dto/create-business-partner-tag.dto";
import { UpdateBusinessPartnerTagDto } from "./dto/update-business-partner-tag.dto";

@Injectable()
export class BusinessPartnerTagsService {
  constructor(
    private readonly businessPartnerTagsRepository: BusinessPartnerTagsRepository,
  ) {}

  createTag(
    workspaceId: string,
    data: CreateBusinessPartnerTagDto,
  ): Promise<BusinessPartnerTagRecord> {
    return this.businessPartnerTagsRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
    });
  }

  listWorkspaceTags(workspaceId: string): Promise<BusinessPartnerTagRecord[]> {
    return this.businessPartnerTagsRepository.findByWorkspace(workspaceId);
  }

  async getTag(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerTagRecord> {
    return this.requireTag(workspaceId, code);
  }

  async updateTag(
    workspaceId: string,
    code: string,
    data: UpdateBusinessPartnerTagDto,
  ): Promise<BusinessPartnerTagRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireTag(workspaceId, normalizedCode);

    return this.businessPartnerTagsRepository.update(
      workspaceId,
      normalizedCode,
      data,
    );
  }

  async disableTag(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerTagRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireTag(workspaceId, normalizedCode);

    return this.businessPartnerTagsRepository.disable(
      workspaceId,
      normalizedCode,
    );
  }

  private async requireTag(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerTagRecord> {
    const normalizedCode = this.normalizeCode(code);
    const tag = await this.businessPartnerTagsRepository.findByWorkspaceAndCode(
      workspaceId,
      normalizedCode,
    );

    if (!tag) {
      throw new NotFoundException(`Business partner tag "${code}" not found`);
    }

    return tag;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Business partner tag code is required");
    }

    return normalizedCode;
  }
}
