import { Module } from "@nestjs/common";
import { BusinessPartnerSearchController } from "./business-partner-search.controller";
import { BusinessPartnerSearchRepository } from "./business-partner-search.repository";
import { BusinessPartnerSearchService } from "./business-partner-search.service";

@Module({
  controllers: [BusinessPartnerSearchController],
  providers: [BusinessPartnerSearchRepository, BusinessPartnerSearchService],
})
export class BusinessPartnerSearchModule {}
