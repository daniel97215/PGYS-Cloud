export interface PublicWorkspace {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  status: string;
}

export interface WorkspaceContract {
  findById(id: string): Promise<PublicWorkspace | null>;
  findBySlug(slug: string): Promise<PublicWorkspace | null>;
  exists(id: string): Promise<boolean>;
}

