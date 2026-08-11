import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CrmActivityStatus } from "@prisma/client";
import { CrmOpportunitiesService } from "../crm-opportunities/crm-opportunities.service";
import { CreateCrmActivityDto } from "./dto/create-crm-activity.dto";
import { UpdateCrmActivityDto } from "./dto/update-crm-activity.dto";
import {
  CrmActivitiesRepository,
  CrmActivityRecord,
  UpdateCrmActivityData,
} from "./crm-activities.repository";

@Injectable()
export class CrmActivitiesService {
  constructor(
    private readonly repository: CrmActivitiesRepository,
    private readonly opportunitiesService: CrmOpportunitiesService,
  ) {}

  async create(
    workspaceId: string,
    data: CreateCrmActivityDto,
  ): Promise<CrmActivityRecord> {
    await this.validateReferences(
      workspaceId,
      data.businessPartnerId,
      data.opportunityId,
      data.contactId,
      data.responsibleMemberId,
    );
    return this.repository.create({
      workspaceId,
      businessPartnerId: data.businessPartnerId,
      ...(data.opportunityId === undefined
        ? {}
        : { opportunityId: data.opportunityId }),
      ...(data.contactId === undefined ? {} : { contactId: data.contactId }),
      ...(data.responsibleMemberId === undefined
        ? {}
        : { responsibleMemberId: data.responsibleMemberId }),
      type: data.type,
      title: data.title,
      ...(data.description === undefined
        ? {}
        : { description: data.description }),
      ...(data.scheduledAt === undefined
        ? {}
        : { scheduledAt: new Date(data.scheduledAt) }),
    });
  }

  list(workspaceId: string): Promise<CrmActivityRecord[]> {
    return this.repository.findByWorkspace(workspaceId);
  }

  async get(workspaceId: string, id: string): Promise<CrmActivityRecord> {
    const activity = await this.repository.findById(workspaceId, id);
    if (!activity) {
      throw new NotFoundException(`CRM activity "${id}" not found`);
    }
    return activity;
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdateCrmActivityDto,
  ): Promise<CrmActivityRecord> {
    const activity = await this.requirePlanned(workspaceId, id);
    await this.validateReferences(
      workspaceId,
      activity.businessPartnerId,
      data.opportunityId,
      data.contactId,
      data.responsibleMemberId,
    );
    const update: UpdateCrmActivityData = {
      ...(data.opportunityId === undefined
        ? {}
        : { opportunityId: data.opportunityId }),
      ...(data.contactId === undefined ? {} : { contactId: data.contactId }),
      ...(data.responsibleMemberId === undefined
        ? {}
        : { responsibleMemberId: data.responsibleMemberId }),
      ...(data.type === undefined ? {} : { type: data.type }),
      ...(data.title === undefined ? {} : { title: data.title }),
      ...(data.description === undefined
        ? {}
        : { description: data.description }),
      ...(data.scheduledAt === undefined
        ? {}
        : { scheduledAt: new Date(data.scheduledAt) }),
    };
    const updated = await this.repository.updatePlanned(workspaceId, id, update);
    if (!updated) {
      throw new BadRequestException("Only planned CRM activities can be modified");
    }
    return updated;
  }

  complete(workspaceId: string, id: string): Promise<CrmActivityRecord> {
    return this.transition(
      workspaceId,
      id,
      CrmActivityStatus.COMPLETED,
      new Date(),
    );
  }

  cancel(workspaceId: string, id: string): Promise<CrmActivityRecord> {
    return this.transition(workspaceId, id, CrmActivityStatus.CANCELLED, null);
  }

  private async transition(
    workspaceId: string,
    id: string,
    status: CrmActivityStatus,
    completedAt: Date | null,
  ): Promise<CrmActivityRecord> {
    await this.requirePlanned(workspaceId, id);
    const activity = await this.repository.transitionPlanned(
      workspaceId,
      id,
      status,
      completedAt,
    );
    if (!activity) {
      throw new BadRequestException("Only planned CRM activities can transition");
    }
    return activity;
  }

  private async requirePlanned(
    workspaceId: string,
    id: string,
  ): Promise<CrmActivityRecord> {
    const activity = await this.get(workspaceId, id);
    if (activity.status !== CrmActivityStatus.PLANNED) {
      throw new BadRequestException("Completed or cancelled CRM activities are immutable");
    }
    return activity;
  }

  private async validateReferences(
    workspaceId: string,
    businessPartnerId: string,
    opportunityId?: string,
    contactId?: string,
    responsibleMemberId?: string,
  ): Promise<void> {
    if (!(await this.repository.businessPartnerExists(workspaceId, businessPartnerId))) {
      throw new NotFoundException(`Business partner "${businessPartnerId}" not found`);
    }

    if (opportunityId !== undefined) {
      const opportunity = await this.opportunitiesService.get(
        workspaceId,
        opportunityId,
      );
      if (opportunity.businessPartnerId !== businessPartnerId) {
        throw new BadRequestException("Opportunity does not belong to business partner");
      }
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
}
