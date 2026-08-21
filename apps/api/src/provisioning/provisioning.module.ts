import { Module } from "@nestjs/common";
import { PlatformAuthorizationModule } from "../platform-administration/platform-authorization.module";
import { ProvisioningOrchestratorService } from "./provisioning-orchestrator.service";
import { ProvisioningController } from "./provisioning.controller";
import { ProvisioningRepository } from "./provisioning.repository";
import { ProvisioningService } from "./provisioning.service";

@Module({
  imports: [PlatformAuthorizationModule],
  controllers: [ProvisioningController],
  providers: [
    ProvisioningRepository,
    ProvisioningService,
    ProvisioningOrchestratorService,
  ],
})
export class ProvisioningModule {}
