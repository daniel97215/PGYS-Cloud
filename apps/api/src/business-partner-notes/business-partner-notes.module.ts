import { Module } from "@nestjs/common";
import { BusinessPartnerNotesController } from "./business-partner-notes.controller";
import { BusinessPartnerNotesRepository } from "./business-partner-notes.repository";
import { BusinessPartnerNotesService } from "./business-partner-notes.service";

@Module({
  controllers: [BusinessPartnerNotesController],
  providers: [BusinessPartnerNotesRepository, BusinessPartnerNotesService],
})
export class BusinessPartnerNotesModule {}
