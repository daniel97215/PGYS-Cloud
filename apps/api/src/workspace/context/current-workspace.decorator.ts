import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import {
  RequestWithWorkspaceContext,
  WorkspaceContext,
} from "./workspace-context.interface";

export const CurrentWorkspace = createParamDecorator(
  (_data: unknown, context: ExecutionContext): WorkspaceContext | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithWorkspaceContext>();

    return request.workspaceContext;
  },
);

