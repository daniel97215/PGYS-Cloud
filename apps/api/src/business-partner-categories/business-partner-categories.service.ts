import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BusinessPartnerCategoriesRepository,
  BusinessPartnerCategoryRecord,
} from "./business-partner-categories.repository";
import { CreateBusinessPartnerCategoryDto } from "./dto/create-business-partner-category.dto";
import { UpdateBusinessPartnerCategoryDto } from "./dto/update-business-partner-category.dto";

@Injectable()
export class BusinessPartnerCategoriesService {
  constructor(
    private readonly businessPartnerCategoriesRepository: BusinessPartnerCategoriesRepository,
  ) {}

  createCategory(
    workspaceId: string,
    data: CreateBusinessPartnerCategoryDto,
  ): Promise<BusinessPartnerCategoryRecord> {
    return this.businessPartnerCategoriesRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
    });
  }

  listWorkspaceCategories(
    workspaceId: string,
  ): Promise<BusinessPartnerCategoryRecord[]> {
    return this.businessPartnerCategoriesRepository.findByWorkspace(workspaceId);
  }

  async getCategory(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerCategoryRecord> {
    return this.requireCategory(workspaceId, code);
  }

  async updateCategory(
    workspaceId: string,
    code: string,
    data: UpdateBusinessPartnerCategoryDto,
  ): Promise<BusinessPartnerCategoryRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireCategory(workspaceId, normalizedCode);

    return this.businessPartnerCategoriesRepository.update(
      workspaceId,
      normalizedCode,
      data,
    );
  }

  async disableCategory(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerCategoryRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireCategory(workspaceId, normalizedCode);

    return this.businessPartnerCategoriesRepository.disable(workspaceId, normalizedCode);
  }

  private async requireCategory(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerCategoryRecord> {
    const normalizedCode = this.normalizeCode(code);
    const category =
      await this.businessPartnerCategoriesRepository.findByWorkspaceAndCode(
        workspaceId,
        normalizedCode,
      );

    if (!category) {
      throw new NotFoundException(`Customer category "${code}" not found`);
    }

    return category;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Customer category code is required");
    }

    return normalizedCode;
  }
}
