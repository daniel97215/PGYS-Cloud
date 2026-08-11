import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BusinessPartnerCategoriesRepository,
  BusinessPartnerCategoryAssignmentRecord,
  BusinessPartnerCategoryRecord,
} from "./business-partner-categories.repository";
import { CreateBusinessPartnerCategoryDto } from "./dto/create-business-partner-category.dto";
import { UpdateBusinessPartnerCategoryDto } from "./dto/update-business-partner-category.dto";
import { AssignBusinessPartnerCategoryDto } from "./dto/assign-business-partner-category.dto";

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

  async assignCategory(
    workspaceId: string,
    businessPartnerCode: string,
    data: AssignBusinessPartnerCategoryDto,
  ): Promise<BusinessPartnerCategoryAssignmentRecord> {
    const [businessPartner, category] = await Promise.all([
      this.requireBusinessPartner(workspaceId, businessPartnerCode),
      this.requireCategory(workspaceId, data.categoryCode),
    ]);
    const existing = await this.businessPartnerCategoriesRepository.findAssignment(
      workspaceId,
      businessPartner.id,
      category.id,
    );

    if (existing) {
      throw new ConflictException(
        `Category "${category.code}" is already assigned to business partner "${businessPartner.code}"`,
      );
    }

    return this.businessPartnerCategoriesRepository.createAssignment({
      workspaceId,
      businessPartnerId: businessPartner.id,
      businessPartnerCategoryId: category.id,
    });
  }

  async removeCategory(
    workspaceId: string,
    businessPartnerCode: string,
    categoryCode: string,
  ): Promise<void> {
    const [businessPartner, category] = await Promise.all([
      this.requireBusinessPartner(workspaceId, businessPartnerCode),
      this.requireCategory(workspaceId, categoryCode),
    ]);
    const removed = await this.businessPartnerCategoriesRepository.removeAssignment(
      workspaceId,
      businessPartner.id,
      category.id,
    );

    if (!removed) {
      throw new NotFoundException(
        `Category "${category.code}" is not assigned to business partner "${businessPartner.code}"`,
      );
    }
  }

  async listBusinessPartnerCategories(
    workspaceId: string,
    businessPartnerCode: string,
  ): Promise<BusinessPartnerCategoryRecord[]> {
    const businessPartner = await this.requireBusinessPartner(
      workspaceId,
      businessPartnerCode,
    );
    const assignments =
      await this.businessPartnerCategoriesRepository.findAssignmentsByBusinessPartner(
        workspaceId,
        businessPartner.id,
      );

    return assignments.map((assignment) => assignment.businessPartnerCategory);
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

  private async requireBusinessPartner(workspaceId: string, code: string) {
    const normalizedCode = this.normalizeBusinessPartnerCode(code);
    const businessPartner =
      await this.businessPartnerCategoriesRepository.findBusinessPartnerByCode(
        workspaceId,
        normalizedCode,
      );

    if (!businessPartner) {
      throw new NotFoundException(`Business partner "${code}" not found`);
    }

    return businessPartner;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Customer category code is required");
    }

    return normalizedCode;
  }

  private normalizeBusinessPartnerCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Business partner code is required");
    }

    return normalizedCode;
  }
}
