import { Module } from "@nestjs/common";
import { PlatformAdministrationController } from "./platform-administration.controller";
import { PlatformAdministrationRepository } from "./platform-administration.repository";
import { PlatformAdministrationService } from "./platform-administration.service";
import { PlatformRolesGuard } from "./platform-roles.guard";

@Module({
  controllers: [PlatformAdministrationController],
  providers: [
    PlatformAdministrationRepository,
    PlatformAdministrationService,
    PlatformRolesGuard,
  ],
})
export class PlatformAdministrationModule {}
