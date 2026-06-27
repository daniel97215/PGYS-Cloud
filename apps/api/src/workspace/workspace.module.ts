import { Module } from "@nestjs/common";
import { WorkspaceProfileController } from "./workspace-profile.controller";
import { WorkspaceSettingsController } from "./workspace-settings.controller";
import { WorkspaceController } from "./workspace.controller";
import { WorkspaceRepository } from "./workspace.repository";
import { WorkspaceService } from "./workspace.service";

@Module({
  controllers: [
    WorkspaceController,
    WorkspaceProfileController,
    WorkspaceSettingsController,
  ],
  providers: [WorkspaceRepository, WorkspaceService],
})
export class WorkspaceModule {}
