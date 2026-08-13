import { OvhHostingInstanceStatus } from "./ovh-hosting.constants";

export interface OvhHostingServiceReference {
  workspaceId: string;
  workspaceServiceId: string;
}

export interface CreateOvhHostingInstanceRequest
  extends OvhHostingServiceReference {
  idempotencyKey: string;
}

export interface ReadOvhHostingInstanceRequest
  extends OvhHostingServiceReference {
  externalServiceId: string;
}

export interface ChangeOvhHostingInstanceStateRequest
  extends ReadOvhHostingInstanceRequest {
  idempotencyKey: string;
}

export interface OvhHostingProviderConfiguration {
  apiEndpoint: string;
  hostingProfile: string;
}

export interface CreateOvhHostingProviderRequest
  extends CreateOvhHostingInstanceRequest,
    OvhHostingProviderConfiguration {}

export interface OvhHostingProviderResponse {
  externalServiceId: string;
  status: OvhHostingInstanceStatus;
}

export interface OvhHostingInstanceResponse
  extends OvhHostingProviderResponse,
    OvhHostingServiceReference {
  provider: "OVH";
}

export interface OvhHostingTerminationPreparation
  extends ReadOvhHostingInstanceRequest {
  provider: "OVH";
  status: "PREPARED";
  destructiveExecutionAllowed: false;
}

export interface OvhHostingProviderAdapter {
  readonly providerId: "OVH";

  createHostingInstance(
    request: CreateOvhHostingProviderRequest,
  ): Promise<OvhHostingProviderResponse>;

  getHostingInstance(
    request: ReadOvhHostingInstanceRequest,
  ): Promise<OvhHostingProviderResponse>;

  suspendHostingInstance(
    request: ChangeOvhHostingInstanceStateRequest,
  ): Promise<OvhHostingProviderResponse>;

  reactivateHostingInstance(
    request: ChangeOvhHostingInstanceStateRequest,
  ): Promise<OvhHostingProviderResponse>;
}
