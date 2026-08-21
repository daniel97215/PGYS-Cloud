import { Module } from "@nestjs/common";
import { PlatformAdministrationRepository } from "./platform-administration.repository";
import { PlatformRolesGuard } from "./platform-roles.guard";

@Module({
  providers: [PlatformAdministrationRepository, PlatformRolesGuard],
  exports: [PlatformAdministrationRepository, PlatformRolesGuard],
})
export class PlatformAuthorizationModule {}
