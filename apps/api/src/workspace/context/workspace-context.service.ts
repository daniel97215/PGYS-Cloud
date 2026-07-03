import { BadRequestException, Injectable } from "@nestjs/common";
import {
  RequestWithWorkspaceContext,
  WorkspaceContext,
} from "./workspace-context.interface";

@Injectable()
export class WorkspaceContextService {
  getCurrentContext(
    request: RequestWithWorkspaceContext,
  ): WorkspaceContext | undefined {
    return request.workspaceContext;
  }

  requireCurrentContext(request: RequestWithWorkspaceContext): WorkspaceContext {
    const workspaceContext = this.getCurrentContext(request);

    if (!workspaceContext) {
      throw new BadRequestException("Workspace context is required");
    }

    return workspaceContext;
  }

  getCurrentWorkspaceId(request: RequestWithWorkspaceContext): string {
    return this.requireCurrentContext(request).workspaceId;
  }
}

