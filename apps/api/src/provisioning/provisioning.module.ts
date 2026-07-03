import { Module } from "@nestjs/common";
import { ProvisioningOrchestratorService } from "./provisioning-orchestrator.service";
import { ProvisioningController } from "./provisioning.controller";
import { ProvisioningRepository } from "./provisioning.repository";
import { ProvisioningService } from "./provisioning.service";

@Module({
  controllers: [ProvisioningController],
  providers: [
    ProvisioningRepository,
    ProvisioningService,
    ProvisioningOrchestratorService,
  ],
})
export class ProvisioningModule {}
