import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { AI_PROVIDER_ADAPTERS, AiProviderId } from "./ai.constants";
import { AiProviderAdapter } from "./ai-provider.contract";

@Injectable()
export class AiProviderRegistryService {
  constructor(
    @Inject(AI_PROVIDER_ADAPTERS)
    private readonly adapters: readonly AiProviderAdapter[],
  ) {}

  get(providerId: AiProviderId): AiProviderAdapter {
    const adapter = this.adapters.find(
      (candidate) => candidate.providerId === providerId,
    );

    if (!adapter) {
      throw new ServiceUnavailableException(
        `AI provider "${providerId}" is unavailable`,
      );
    }

    return adapter;
  }
}
