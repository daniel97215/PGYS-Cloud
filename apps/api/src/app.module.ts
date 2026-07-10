import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { BrandsModule } from "./brands/brands.module";
import { BusinessPartnerAddressesModule } from "./business-partner-addresses/business-partner-addresses.module";
import { BusinessPartnerContactsModule } from "./business-partner-contacts/business-partner-contacts.module";
import { BusinessPartnerDocumentsModule } from "./business-partner-documents/business-partner-documents.module";
import { BusinessPartnerNotesModule } from "./business-partner-notes/business-partner-notes.module";
import { BusinessPartnerRolesModule } from "./business-partner-roles/business-partner-roles.module";
import { BusinessPartnerSearchModule } from "./business-partner-search/business-partner-search.module";
import { BusinessPartnerTagsModule } from "./business-partner-tags/business-partner-tags.module";
import { BusinessPartnerTimelineModule } from "./business-partner-timeline/business-partner-timeline.module";
import { validateEnvironment } from "./config/environment";
import { BusinessPartnerCategoriesModule } from "./business-partner-categories/business-partner-categories.module";
import { BusinessPartnersModule } from "./business-partners/business-partners.module";
import { FeaturesModule } from "./features/features.module";
import { HealthModule } from "./health/health.module";
import { ManufacturersModule } from "./manufacturers/manufacturers.module";
import { OffersModule } from "./offers/offers.module";
import { PricingModule } from "./pricing/pricing.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductCategoriesModule } from "./product-categories/product-categories.module";
import { ProductsModule } from "./products/products.module";
import { ProvisioningModule } from "./provisioning/provisioning.module";
import { ServiceCatalogModule } from "./service-catalog/service-catalog.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { UnitsModule } from "./units/units.module";
import { WorkspaceModule } from "./workspace/workspace.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    PrismaModule,
    HealthModule,
    BrandsModule,
    BusinessPartnerAddressesModule,
    BusinessPartnerContactsModule,
    BusinessPartnerDocumentsModule,
    BusinessPartnerNotesModule,
    BusinessPartnerRolesModule,
    BusinessPartnerSearchModule,
    BusinessPartnerTagsModule,
    BusinessPartnerTimelineModule,
    BusinessPartnerCategoriesModule,
    BusinessPartnersModule,
    FeaturesModule,
    ManufacturersModule,
    OffersModule,
    PricingModule,
    ProductCategoriesModule,
    ProductsModule,
    ProvisioningModule,
    ServiceCatalogModule,
    SubscriptionsModule,
    UnitsModule,
    WorkspaceModule,
    AuthModule,
  ],
})
export class AppModule {}
