import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { SMS_PROVIDER_ADAPTERS } from "./sms.constants";
import { SmsProviderAdapter } from "./sms-provider.contract";

@Injectable()
export class SmsProviderRegistryService {
  constructor(
    @Inject(SMS_PROVIDER_ADAPTERS)
    private readonly adapters: readonly SmsProviderAdapter[],
  ) {}

  get(providerId: string): SmsProviderAdapter {
    const normalizedProviderId = providerId.trim().toUpperCase();
    const adapter = this.adapters.find(
      (candidate) =>
        candidate.providerId.trim().toUpperCase() === normalizedProviderId,
    );

    if (!adapter) {
      throw new ServiceUnavailableException(
        `SMS provider "${normalizedProviderId}" is unavailable`,
      );
    }

    return adapter;
  }
}
