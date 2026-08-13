import { Module } from "@nestjs/common";
import { EmailModule } from "./email/email.module";
import { SmsModule } from "./sms/sms.module";
import { StripeModule } from "./stripe/stripe.module";

@Module({
  imports: [EmailModule, SmsModule, StripeModule],
  exports: [EmailModule, SmsModule, StripeModule],
})
export class IntegrationsModule {}
