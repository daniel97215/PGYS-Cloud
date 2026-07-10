import { Injectable } from "@nestjs/common";
import {
  BusinessPartnerSearchRepository,
  BusinessPartnerSearchResult,
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
}
