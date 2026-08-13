import { Module } from "@nestjs/common";
import { EMAIL_PROVIDER_ADAPTERS } from "./email.constants";
import { EmailProviderConfigService } from "./email-provider-config.service";
import { EmailProviderRegistryService } from "./email-provider-registry.service";
import { TransactionalEmailService } from "./transactional-email.service";

@Module({
  providers: [
    { provide: EMAIL_PROVIDER_ADAPTERS, useValue: [] },
    EmailProviderConfigService,
    EmailProviderRegistryService,
    TransactionalEmailService,
  ],
  exports: [TransactionalEmailService],
})
export class EmailModule {}
