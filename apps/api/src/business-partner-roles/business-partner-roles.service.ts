import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BusinessPartnerRoleRecord,
  BusinessPartnerRolesRepository,
} from "./business-partner-roles.repository";
import { CreateBusinessPartnerRoleDto } from "./dto/create-business-partner-role.dto";
import { UpdateBusinessPartnerRoleDto } from "./dto/update-business-partner-role.dto";

@Injectable()
export class BusinessPartnerRolesService {
  constructor(
    private readonly businessPartnerRolesRepository: BusinessPartnerRolesRepository,
  ) {}

  createRole(
    workspaceId: string,
    data: CreateBusinessPartnerRoleDto,
  ): Promise<BusinessPartnerRoleRecord> {
    return this.businessPartnerRolesRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
    });
  }

  listWorkspaceRoles(workspaceId: string): Promise<BusinessPartnerRoleRecord[]> {
    return this.businessPartnerRolesRepository.findByWorkspace(workspaceId);
  }

  async getRole(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerRoleRecord> {
    return this.requireRole(workspaceId, code);
  }

  async updateRole(
    workspaceId: string,
    code: string,
    data: UpdateBusinessPartnerRoleDto,
  ): Promise<BusinessPartnerRoleRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireRole(workspaceId, normalizedCode);

    return this.businessPartnerRolesRepository.update(
      workspaceId,
      normalizedCode,
      data,
    );
  }

  async disableRole(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerRoleRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireRole(workspaceId, normalizedCode);

    return this.businessPartnerRolesRepository.disable(
      workspaceId,
      normalizedCode,
    );
  }

  private async requireRole(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerRoleRecord> {
    const normalizedCode = this.normalizeCode(code);
    const role =
      await this.businessPartnerRolesRepository.findByWorkspaceAndCode(
        workspaceId,
        normalizedCode,
      );

    if (!role) {
      throw new NotFoundException(`Business partner role "${code}" not found`);
    }

    return role;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Business partner role code is required");
    }

    return normalizedCode;
  }
}
