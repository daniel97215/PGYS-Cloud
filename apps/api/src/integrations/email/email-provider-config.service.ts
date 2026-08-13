import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { isEmail } from "class-validator";
import { EmailSender } from "./email-provider.contract";

export interface EmailProviderConfiguration {
  provider: string;
  sender: EmailSender;
}

@Injectable()
export class EmailProviderConfigService {
  constructor(private readonly config: ConfigService) {}

  getConfiguration(): EmailProviderConfiguration {
    const provider = this.config.get<string>("EMAIL_PROVIDER")
      ?.trim()
      .toUpperCase();
    const address = this.config.get<string>("EMAIL_FROM_ADDRESS")?.trim();
    const name = this.config.get<string>("EMAIL_FROM_NAME")?.trim();

    if (
      !provider ||
      provider.length > 80 ||
      !address ||
      !isEmail(address) ||
      (name !== undefined && name.length > 120)
    ) {
      throw new ServiceUnavailableException(
        "Email provider is not configured",
      );
    }

    return {
      provider,
      sender: { address, ...(name ? { name } : {}) },
    };
  }
}
