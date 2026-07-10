import { Module } from "@nestjs/common";
import { BusinessPartnerCategoriesController } from "./business-partner-categories.controller";
import { BusinessPartnerCategoriesRepository } from "./business-partner-categories.repository";
import { BusinessPartnerCategoriesService } from "./business-partner-categories.service";

@Module({
  controllers: [BusinessPartnerCategoriesController],
  providers: [BusinessPartnerCategoriesRepository, BusinessPartnerCategoriesService],
})
export class BusinessPartnerCategoriesModule {}
