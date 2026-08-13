import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { EMAIL_PROVIDER_ADAPTERS } from "./email.constants";
import { EmailProviderAdapter } from "./email-provider.contract";

@Injectable()
export class EmailProviderRegistryService {
  constructor(
    @Inject(EMAIL_PROVIDER_ADAPTERS)
    private readonly adapters: readonly EmailProviderAdapter[],
  ) {}

  get(providerId: string): EmailProviderAdapter {
    const normalizedProviderId = providerId.trim().toUpperCase();
    const adapter = this.adapters.find(
      (candidate) =>
        candidate.providerId.trim().toUpperCase() === normalizedProviderId,
    );

    if (!adapter) {
      throw new ServiceUnavailableException(
        `Email provider "${normalizedProviderId}" is unavailable`,
      );
    }

    return adapter;
  }
}
