import { Module } from "@nestjs/common";
import { WorkspaceProfileController } from "./workspace-profile.controller";
import { WorkspaceSettingsController } from "./workspace-settings.controller";
import { WorkspaceServicesController } from "./workspace-services.controller";
import { WorkspaceServicesRepository } from "./workspace-services.repository";
import { WorkspaceServicesService } from "./workspace-services.service";
import { WorkspaceContextModule } from "./context/workspace-context.module";
import { WorkspaceController } from "./workspace.controller";
import { WorkspaceRepository } from "./workspace.repository";
import { WorkspaceService } from "./workspace.service";

@Module({
  imports: [WorkspaceContextModule],
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
  exports: [WorkspaceContextModule],
})
export class WorkspaceModule {}
