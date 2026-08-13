import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AI_PROVIDER, AiProviderId } from "./ai.constants";

export interface AiProviderConfiguration {
  provider: AiProviderId;
  model: string;
}

@Injectable()
export class AiProviderConfigService {
  constructor(private readonly config: ConfigService) {}

  getConfiguration(): AiProviderConfiguration {
    const providerValue = this.config.get<string>("AI_PROVIDER")
      ?.trim()
      .toUpperCase();
    const model = this.config.get<string>("AI_MODEL")?.trim();

    if (!providerValue || !model) {
      throw new ServiceUnavailableException(
        "AI provider is not configured",
      );
    }

    if (!this.isProviderId(providerValue)) {
      throw new ServiceUnavailableException(
        `AI provider "${providerValue}" is not supported`,
      );
    }

    return { provider: providerValue, model };
  }

  private isProviderId(value: string): value is AiProviderId {
    return Object.values(AI_PROVIDER).some((provider) => provider === value);
  }
}
