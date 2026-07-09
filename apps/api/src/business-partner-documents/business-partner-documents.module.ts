import { Module } from "@nestjs/common";
import { BusinessPartnerDocumentsController } from "./business-partner-documents.controller";
import { BusinessPartnerDocumentsRepository } from "./business-partner-documents.repository";
import { BusinessPartnerDocumentsService } from "./business-partner-documents.service";

@Module({
  controllers: [BusinessPartnerDocumentsController],
  providers: [
    BusinessPartnerDocumentsRepository,
    BusinessPartnerDocumentsService,
  ],
})
export class BusinessPartnerDocumentsModule {}
