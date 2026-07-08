import { Module } from "@nestjs/common";
import { BusinessPartnerContactsController } from "./business-partner-contacts.controller";
import { BusinessPartnerContactsRepository } from "./business-partner-contacts.repository";
import { BusinessPartnerContactsService } from "./business-partner-contacts.service";

@Module({
  controllers: [BusinessPartnerContactsController],
  providers: [BusinessPartnerContactsRepository, BusinessPartnerContactsService],
})
export class BusinessPartnerContactsModule {}
