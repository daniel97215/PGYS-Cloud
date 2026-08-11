import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CrmOpportunityStatus,
  CrmPipelineStageType,
  Prisma,
} from "@prisma/client";
import { CrmPipelinesService } from "../crm-pipelines/crm-pipelines.service";
import { CreateCrmOpportunityDto } from "./dto/create-crm-opportunity.dto";
import { MoveCrmOpportunityDto } from "./dto/move-crm-opportunity.dto";
import { UpdateCrmOpportunityDto } from "./dto/update-crm-opportunity.dto";
import {
  CrmOpportunityRecord,
  CrmOpportunitiesRepository,
  UpdateCrmOpportunityData,
} from "./crm-opportunities.repository";

@Injectable()
export class CrmOpportunitiesService {
  constructor(
    private readonly repository: CrmOpportunitiesRepository,
    private readonly pipelinesService: CrmPipelinesService,
  ) {}

  async create(
    workspaceId: string,
    data: CreateCrmOpportunityDto,
  ): Promise<CrmOpportunityRecord> {
    const code = this.normalizeCode(data.code);
    if (await this.repository.findByCode(workspaceId, code)) {
      throw new ConflictException(`CRM opportunity "${code}" already exists`);
    }

    await this.validateReferences(
      workspaceId,
      data.businessPartnerId,
      data.contactId,
      data.responsibleMemberId,
    );
    const { stage } = await this.pipelinesService.getPipelineStageByIds(
      workspaceId,
      data.pipelineId,
      data.stageId,
    );

    return this.repository.create({
      workspaceId,
      code,
      title: data.title,
      businessPartnerId: data.businessPartnerId,
      ...(data.contactId === undefined ? {} : { contactId: data.contactId }),
      pipelineId: data.pipelineId,
      stageId: data.stageId,
      ...(data.amount === undefined
        ? {}
        : { amount: new Prisma.Decimal(data.amount) }),
      currency: this.normalizeCurrency(data.currency),
      ...(data.dueAt === undefined ? {} : { dueAt: new Date(data.dueAt) }),
      ...(data.responsibleMemberId === undefined
        ? {}
        : { responsibleMemberId: data.responsibleMemberId }),
      status: this.toOpportunityStatus(stage.type),
    });
  }

  list(workspaceId: string): Promise<CrmOpportunityRecord[]> {
    return this.repository.findByWorkspace(workspaceId);
  }

  async get(workspaceId: string, id: string): Promise<CrmOpportunityRecord> {
    const opportunity = await this.repository.findById(workspaceId, id);
    if (!opportunity) {
      throw new NotFoundException(`CRM opportunity "${id}" not found`);
    }
    return opportunity;
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdateCrmOpportunityDto,
  ): Promise<CrmOpportunityRecord> {
    const opportunity = await this.requireOpen(workspaceId, id);
    await this.validateReferences(
      workspaceId,
      opportunity.businessPartnerId,
      data.contactId,
      data.responsibleMemberId,
    );

    const update: UpdateCrmOpportunityData = {
      ...(data.title === undefined ? {} : { title: data.title }),
      ...(data.contactId === undefined ? {} : { contactId: data.contactId }),
      ...(data.amount === undefined
        ? {}
        : { amount: new Prisma.Decimal(data.amount) }),
      ...(data.currency === undefined
        ? {}
        : { currency: this.normalizeCurrency(data.currency) }),
      ...(data.dueAt === undefined ? {} : { dueAt: new Date(data.dueAt) }),
      ...(data.responsibleMemberId === undefined
        ? {}
        : { responsibleMemberId: data.responsibleMemberId }),
    };
    const updated = await this.repository.updateOpen(workspaceId, id, update);
    if (!updated) {
      throw new BadRequestException("Only open CRM opportunities can be modified");
    }
    return updated;
  }

  async moveStage(
    workspaceId: string,
    id: string,
    data: MoveCrmOpportunityDto,
  ): Promise<CrmOpportunityRecord> {
    const opportunity = await this.requireOpen(workspaceId, id);
    const { stage } = await this.pipelinesService.getPipelineStageByIds(
      workspaceId,
      opportunity.pipelineId,
      data.stageId,
    );
    const updated = await this.repository.moveOpenToStage(
      workspaceId,
      id,
      stage.id,
      this.toOpportunityStatus(stage.type),
    );
    if (!updated) {
      throw new BadRequestException("Only open CRM opportunities can change stage");
    }
    return updated;
  }

  private async requireOpen(
    workspaceId: string,
    id: string,
  ): Promise<CrmOpportunityRecord> {
    const opportunity = await this.get(workspaceId, id);
    if (opportunity.status !== CrmOpportunityStatus.OPEN) {
      throw new BadRequestException("Won or lost CRM opportunities are immutable");
    }
    return opportunity;
  }

  private async validateReferences(
    workspaceId: string,
    businessPartnerId: string,
    contactId?: string,
    responsibleMemberId?: string,
  ): Promise<void> {
    if (!(await this.repository.businessPartnerExists(workspaceId, businessPartnerId))) {
      throw new NotFoundException(`Business partner "${businessPartnerId}" not found`);
    }

    if (contactId !== undefined) {
      const contact = await this.repository.findContact(workspaceId, contactId);
      if (!contact) {
        throw new NotFoundException(`Business partner contact "${contactId}" not found`);
      }
      if (contact.businessPartnerId !== businessPartnerId) {
        throw new BadRequestException("Contact does not belong to business partner");
      }
    }

    if (
      responsibleMemberId !== undefined &&
      !(await this.repository.memberExists(workspaceId, responsibleMemberId))
    ) {
      throw new NotFoundException(`Workspace member "${responsibleMemberId}" not found`);
    }
  }

  private toOpportunityStatus(
    type: CrmPipelineStageType,
  ): CrmOpportunityStatus {
    return CrmOpportunityStatus[type];
  }

  private normalizeCode(code: string): string {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      throw new BadRequestException("CRM opportunity code is required");
    }
    return normalized;
  }

  private normalizeCurrency(currency: string): string {
    const normalized = currency.trim().toUpperCase();
    if (normalized.length !== 3) {
      throw new BadRequestException("Currency must use ISO-4217 format");
    }
    return normalized;
  }
}
