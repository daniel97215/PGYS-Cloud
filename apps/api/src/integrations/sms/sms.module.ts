import { Module } from "@nestjs/common";
import { SMS_PROVIDER_ADAPTERS } from "./sms.constants";
import { SmsProviderConfigService } from "./sms-provider-config.service";
import { SmsProviderRegistryService } from "./sms-provider-registry.service";
import { TransactionalSmsService } from "./transactional-sms.service";

@Module({
  providers: [
    { provide: SMS_PROVIDER_ADAPTERS, useValue: [] },
    SmsProviderConfigService,
    SmsProviderRegistryService,
    TransactionalSmsService,
  ],
  exports: [TransactionalSmsService],
})
export class SmsModule {}
