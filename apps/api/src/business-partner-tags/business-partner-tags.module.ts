import { Module } from "@nestjs/common";
import { BusinessPartnerTagsController } from "./business-partner-tags.controller";
import { BusinessPartnerTagsRepository } from "./business-partner-tags.repository";
import { BusinessPartnerTagsService } from "./business-partner-tags.service";

@Module({
  controllers: [BusinessPartnerTagsController],
  providers: [BusinessPartnerTagsRepository, BusinessPartnerTagsService],
})
export class BusinessPartnerTagsModule {}
