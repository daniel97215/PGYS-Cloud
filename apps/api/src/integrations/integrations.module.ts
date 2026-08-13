import { Module } from "@nestjs/common";
import { EmailModule } from "./email/email.module";
import { OvhModule } from "./ovh/ovh.module";
import { SmsModule } from "./sms/sms.module";
import { StripeModule } from "./stripe/stripe.module";

@Module({
  imports: [EmailModule, SmsModule, StripeModule, OvhModule],
  exports: [EmailModule, SmsModule, StripeModule, OvhModule],
})
export class IntegrationsModule {}
