import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface SmsProviderConfiguration {
  provider: string;
  from?: string;
}

@Injectable()
export class SmsProviderConfigService {
  constructor(private readonly config: ConfigService) {}

  getConfiguration(): SmsProviderConfiguration {
    const provider = this.config.get<string>("SMS_PROVIDER")
      ?.trim()
      .toUpperCase();
    const from = this.config.get<string>("SMS_FROM")?.trim();

    if (
      !provider ||
      provider.length > 80 ||
      (from !== undefined && (!from || from.length > 32))
    ) {
      throw new ServiceUnavailableException(
        "SMS provider is not configured",
      );
    }

    return { provider, ...(from ? { from } : {}) };
  }
}
