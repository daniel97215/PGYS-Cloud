import { Module } from "@nestjs/common";
import { BusinessPartnerAddressesController } from "./business-partner-addresses.controller";
import { BusinessPartnerAddressesRepository } from "./business-partner-addresses.repository";
import { BusinessPartnerAddressesService } from "./business-partner-addresses.service";

@Module({
  controllers: [BusinessPartnerAddressesController],
  providers: [BusinessPartnerAddressesRepository, BusinessPartnerAddressesService],
})
export class BusinessPartnerAddressesModule {}
