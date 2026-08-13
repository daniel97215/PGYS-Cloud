import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { isURL } from "class-validator";
import { OvhHostingProviderConfiguration } from "./ovh-hosting-provider.contract";

@Injectable()
export class OvhHostingConfigService {
  constructor(private readonly config: ConfigService) {}

  getConfiguration(): OvhHostingProviderConfiguration {
    const apiEndpoint = this.config.get<string>("OVH_API_ENDPOINT")?.trim();
    const hostingProfile = this.config
      .get<string>("OVH_HOSTING_PROFILE")
      ?.trim();

    if (!this.isHttpsUrl(apiEndpoint) || !this.isProfile(hostingProfile)) {
      throw new ServiceUnavailableException(
        "OVH hosting provider is not configured",
      );
    }

    return { apiEndpoint, hostingProfile };
  }

  private isHttpsUrl(value: string | undefined): value is string {
    return (
      value !== undefined &&
      value.length <= 2048 &&
      isURL(value, { protocols: ["https"], require_protocol: true }) &&
      value.toLowerCase().startsWith("https://")
    );
  }

  private isProfile(value: string | undefined): value is string {
    return (
      value !== undefined &&
      value.length > 0 &&
      value.length <= 120 &&
      /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)
    );
  }
}
