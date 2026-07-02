import { Module } from "@nestjs/common";
import { WorkspaceProfileController } from "./workspace-profile.controller";
import { WorkspaceSettingsController } from "./workspace-settings.controller";
import { WorkspaceServicesController } from "./workspace-services.controller";
import { WorkspaceServicesRepository } from "./workspace-services.repository";
import { WorkspaceServicesService } from "./workspace-services.service";
import { WorkspaceController } from "./workspace.controller";
import { WorkspaceRepository } from "./workspace.repository";
import { WorkspaceService } from "./workspace.service";

@Module({
  controllers: [
    WorkspaceController,
    WorkspaceProfileController,
    WorkspaceSettingsController,
    WorkspaceServicesController,
  ],
  providers: [
    WorkspaceRepository,
    WorkspaceService,
    WorkspaceServicesRepository,
    WorkspaceServicesService,
  ],
})
export class WorkspaceModule {}
