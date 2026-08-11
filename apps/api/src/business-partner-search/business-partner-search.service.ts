import { Injectable } from "@nestjs/common";
import {
  BusinessPartnerSearchRepository,
  BusinessPartnerSearchResult,
  BusinessPartnerAudienceCriteria,
  BusinessPartnerAudienceKnownCodes,
  BusinessPartnerAudiencePagination,
  BusinessPartnerAudienceResult,
} from "./business-partner-search.repository";
import { SearchBusinessPartnerDto } from "./dto/search-business-partner.dto";

@Injectable()
export class BusinessPartnerSearchService {
  constructor(
    private readonly businessPartnerSearchRepository: BusinessPartnerSearchRepository,
  ) {}

  searchBusinessPartners(
    workspaceId: string,
    query: SearchBusinessPartnerDto,
  ): Promise<BusinessPartnerSearchResult> {
    return this.businessPartnerSearchRepository.search(workspaceId, query);
  }

  evaluateAudience(
    workspaceId: string,
    criteria: BusinessPartnerAudienceCriteria,
    pagination: BusinessPartnerAudiencePagination,
  ): Promise<BusinessPartnerAudienceResult> {
    return this.businessPartnerSearchRepository.evaluateAudience(
      workspaceId,
      criteria,
      pagination,
    );
  }

  findKnownAudienceCodes(
    workspaceId: string,
    criteria: BusinessPartnerAudienceCriteria,
  ): Promise<BusinessPartnerAudienceKnownCodes> {
    return this.businessPartnerSearchRepository.findKnownAudienceCodes(
      workspaceId,
      criteria,
    );
  }
}
