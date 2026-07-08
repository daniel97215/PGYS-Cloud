import { Module } from "@nestjs/common";
import { BusinessPartnerRolesController } from "./business-partner-roles.controller";
import { BusinessPartnerRolesRepository } from "./business-partner-roles.repository";
import { BusinessPartnerRolesService } from "./business-partner-roles.service";

@Module({
  controllers: [BusinessPartnerRolesController],
  providers: [BusinessPartnerRolesRepository, BusinessPartnerRolesService],
})
export class BusinessPartnerRolesModule {}
