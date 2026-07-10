import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  BusinessPartnerTimelineEntryRecord,
  BusinessPartnerTimelineRepository,
} from "./business-partner-timeline.repository";
import { CreateBusinessPartnerTimelineEntryDto } from "./dto/create-business-partner-timeline-entry.dto";

@Injectable()
export class BusinessPartnerTimelineService {
  constructor(
    private readonly businessPartnerTimelineRepository: BusinessPartnerTimelineRepository,
  ) {}

  createEntry(
    workspaceId: string,
    businessPartnerId: string,
    data: CreateBusinessPartnerTimelineEntryDto,
  ): Promise<BusinessPartnerTimelineEntryRecord> {
    return this.businessPartnerTimelineRepository.create({
      ...data,
      workspaceId,
      businessPartnerId,
      metadata: data.metadata as Prisma.InputJsonObject | undefined,
      occurredAt: new Date(data.occurredAt),
    });
  }

  listBusinessPartnerEntries(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<BusinessPartnerTimelineEntryRecord[]> {
    return this.businessPartnerTimelineRepository.findByBusinessPartner(
      workspaceId,
      businessPartnerId,
    );
  }

  async getEntry(
    workspaceId: string,
    businessPartnerId: string,
    entryId: string,
  ): Promise<BusinessPartnerTimelineEntryRecord> {
    const entry = await this.businessPartnerTimelineRepository.findById(
      workspaceId,
      businessPartnerId,
      entryId,
    );

    if (!entry) {
      throw new NotFoundException(
        `Business partner timeline entry "${entryId}" not found`,
      );
    }

    return entry;
  }
}
