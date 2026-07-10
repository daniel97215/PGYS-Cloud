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
    customerId: string,
    data: CreateBusinessPartnerTimelineEntryDto,
  ): Promise<BusinessPartnerTimelineEntryRecord> {
    return this.businessPartnerTimelineRepository.create({
      ...data,
      workspaceId,
      customerId,
      metadata: data.metadata as Prisma.InputJsonObject | undefined,
      occurredAt: new Date(data.occurredAt),
    });
  }

  listCustomerEntries(
    workspaceId: string,
    customerId: string,
  ): Promise<BusinessPartnerTimelineEntryRecord[]> {
    return this.businessPartnerTimelineRepository.findByCustomer(
      workspaceId,
      customerId,
    );
  }

  async getEntry(
    workspaceId: string,
    customerId: string,
    entryId: string,
  ): Promise<BusinessPartnerTimelineEntryRecord> {
    const entry = await this.businessPartnerTimelineRepository.findById(
      workspaceId,
      customerId,
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
