export interface WorkspaceContext {
  workspaceId: string;
}

export interface RequestWithWorkspaceContext {
  workspaceContext?: WorkspaceContext;
}

