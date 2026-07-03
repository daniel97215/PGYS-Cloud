import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { validateEnvironment } from "./config/environment";
import { FeaturesModule } from "./features/features.module";
import { HealthModule } from "./health/health.module";
import { OffersModule } from "./offers/offers.module";
import { PricingModule } from "./pricing/pricing.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ServiceCatalogModule } from "./service-catalog/service-catalog.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { WorkspaceModule } from "./workspace/workspace.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    PrismaModule,
    HealthModule,
    FeaturesModule,
    OffersModule,
    PricingModule,
    ServiceCatalogModule,
    SubscriptionsModule,
    WorkspaceModule,
    AuthModule,
  ],
})
export class AppModule {}
