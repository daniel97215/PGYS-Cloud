import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./ai/ai.module";
import { CrmPipelinesModule } from "./crm-pipelines/crm-pipelines.module";
import { CrmActivitiesModule } from "./crm-activities/crm-activities.module";
import { CrmOpportunitiesModule } from "./crm-opportunities/crm-opportunities.module";
import { CrmReportingModule } from "./crm-reporting/crm-reporting.module";
import { AuthModule } from "./auth/auth.module";
import { BillingModule } from "./billing/billing.module";
import { CheckoutModule } from "./checkout/checkout.module";
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
import { InventoryAdjustmentsModule } from "./inventory-adjustments/inventory-adjustments.module";
import { InventoryCountsModule } from "./inventory-counts/inventory-counts.module";
import { InventoryItemsModule } from "./inventory-items/inventory-items.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { ManufacturersModule } from "./manufacturers/manufacturers.module";
import { MarketingSegmentsModule } from "./marketing-segments/marketing-segments.module";
import { MarketingCampaignsModule } from "./marketing-campaigns/marketing-campaigns.module";
import { MarketingAutomationsModule } from "./marketing-automations/marketing-automations.module";
import { OffersModule } from "./offers/offers.module";
import { OperationalReportingModule } from "./operational-reporting/operational-reporting.module";
import { PricingModule } from "./pricing/pricing.module";
import { PriceListsModule } from "./price-lists/price-lists.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PurchaseInvoicesModule } from "./purchase-invoices/purchase-invoices.module";
import { PurchaseOrdersModule } from "./purchase-orders/purchase-orders.module";
import { PurchasePaymentsModule } from "./purchase-payments/purchase-payments.module";
import { PurchaseReceiptsModule } from "./purchase-receipts/purchase-receipts.module";
import { PurchaseReturnsModule } from "./purchase-returns/purchase-returns.module";
import { ProductCategoriesModule } from "./product-categories/product-categories.module";
import { ProductAttributesModule } from "./product-attributes/product-attributes.module";
import { ProductBarcodesModule } from "./product-barcodes/product-barcodes.module";
import { ProductMediaModule } from "./product-media/product-media.module";
import { ProductsModule } from "./products/products.module";
import { ProductVariantsModule } from "./product-variants/product-variants.module";
import { ProvisioningModule } from "./provisioning/provisioning.module";
import { ServiceCatalogModule } from "./service-catalog/service-catalog.module";
import { SalesQuotesModule } from "./sales-quotes/sales-quotes.module";
import { SalesOrdersModule } from "./sales-orders/sales-orders.module";
import { SalesDeliveriesModule } from "./sales-deliveries/sales-deliveries.module";
import { SalesInvoicesModule } from "./sales-invoices/sales-invoices.module";
import { SalesPaymentsModule } from "./sales-payments/sales-payments.module";
import { StorageLocationsModule } from "./storage-locations/storage-locations.module";
import { StockMovementsModule } from "./stock-movements/stock-movements.module";
import { StockReservationsModule } from "./stock-reservations/stock-reservations.module";
import { StockTransfersModule } from "./stock-transfers/stock-transfers.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { TaxesModule } from "./taxes/taxes.module";
import { UnitsModule } from "./units/units.module";
import { WarehousesModule } from "./warehouses/warehouses.module";
import { WorkspaceModule } from "./workspace/workspace.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    AiModule,
    PrismaModule,
    BillingModule,
    CheckoutModule,
    CrmActivitiesModule,
    CrmOpportunitiesModule,
    CrmPipelinesModule,
    CrmReportingModule,
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
    InventoryAdjustmentsModule,
    InventoryCountsModule,
    InventoryItemsModule,
    IntegrationsModule,
    ManufacturersModule,
    OperationalReportingModule,
    MarketingSegmentsModule,
    MarketingCampaignsModule,
    MarketingAutomationsModule,
    OffersModule,
    PricingModule,
    PriceListsModule,
    PurchaseInvoicesModule,
    PurchaseOrdersModule,
    PurchasePaymentsModule,
    PurchaseReceiptsModule,
    PurchaseReturnsModule,
    ProductCategoriesModule,
    ProductAttributesModule,
    ProductBarcodesModule,
    ProductMediaModule,
    ProductsModule,
    ProductVariantsModule,
    ProvisioningModule,
    ServiceCatalogModule,
    SalesQuotesModule,
    SalesOrdersModule,
    SalesDeliveriesModule,
    SalesInvoicesModule,
    SalesPaymentsModule,
    StorageLocationsModule,
    StockMovementsModule,
    StockReservationsModule,
    StockTransfersModule,
    SubscriptionsModule,
    TaxesModule,
    UnitsModule,
    WarehousesModule,
    WorkspaceModule,
    AuthModule,
  ],
})
export class AppModule {}
