import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { PlatformOperatorRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FeaturesController } from "../features/features.controller";
import { FeaturesModule } from "../features/features.module";
import { OfferFeaturesController } from "../offers/offer-features.controller";
import { OffersController } from "../offers/offers.controller";
import { OffersModule } from "../offers/offers.module";
import { PLATFORM_ROLES_KEY } from "../platform-administration/platform-roles.decorator";
import { PlatformRolesGuard } from "../platform-administration/platform-roles.guard";
import { PricingController } from "../pricing/pricing.controller";
import { PricingModule } from "../pricing/pricing.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ProvisioningController } from "../provisioning/provisioning.controller";
import { ProvisioningModule } from "../provisioning/provisioning.module";
import { ServiceCatalogController } from "../service-catalog/service-catalog.controller";
import { ServiceCatalogModule } from "../service-catalog/service-catalog.module";
import { SubscriptionsController } from "../subscriptions/subscriptions.controller";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { WorkspaceServicesController } from "../workspace/workspace-services.controller";
import { WorkspaceModule } from "../workspace/workspace.module";

const readRoles = [
  PlatformOperatorRole.PLATFORM_ADMIN,
  PlatformOperatorRole.PLATFORM_SUPPORT,
];

const controllers = [
  ServiceCatalogController,
  FeaturesController,
  OffersController,
  OfferFeaturesController,
  PricingController,
  SubscriptionsController,
  ProvisioningController,
  WorkspaceServicesController,
] as const;

const adminMethods = [
  [ServiceCatalogController, "create"],
  [ServiceCatalogController, "update"],
  [ServiceCatalogController, "archive"],
  [FeaturesController, "create"],
  [FeaturesController, "update"],
  [FeaturesController, "archive"],
  [OffersController, "create"],
  [OffersController, "update"],
  [OffersController, "activate"],
  [OffersController, "archive"],
  [OfferFeaturesController, "addFeatureToOffer"],
  [OfferFeaturesController, "removeFeatureFromOffer"],
  [PricingController, "create"],
  [PricingController, "update"],
  [PricingController, "archive"],
  [SubscriptionsController, "create"],
  [SubscriptionsController, "changeOffer"],
  [SubscriptionsController, "suspend"],
  [SubscriptionsController, "reactivate"],
  [SubscriptionsController, "cancel"],
  [SubscriptionsController, "expire"],
  [ProvisioningController, "provision"],
  [ProvisioningController, "reprovision"],
  [ProvisioningController, "deprovision"],
  [WorkspaceServicesController, "create"],
  [WorkspaceServicesController, "remove"],
  [WorkspaceServicesController, "updateConfiguration"],
] as const;

describe("Core platform authorization", () => {
  it.each(controllers)(
    "%s requires JWT and a platform operator role",
    (controller) => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, controller) as
        | unknown[]
        | undefined;
      const roles = Reflect.getMetadata(
        PLATFORM_ROLES_KEY,
        controller,
      ) as PlatformOperatorRole[] | undefined;

      expect(guards).toEqual(
        expect.arrayContaining([JwtAuthGuard, PlatformRolesGuard]),
      );
      expect(roles).toEqual(readRoles);
    },
  );

  it.each(adminMethods)(
    "%s.%s is restricted to platform administrators",
    (controller, methodName) => {
      const prototype = controller.prototype as unknown as Record<
        string,
        unknown
      >;
      const handler = prototype[methodName];
      const roles = Reflect.getMetadata(
        PLATFORM_ROLES_KEY,
        handler as object,
      ) as PlatformOperatorRole[] | undefined;

      expect(roles).toEqual([PlatformOperatorRole.PLATFORM_ADMIN]);
    },
  );

  it("resolves authorization dependencies for every secured module", async () => {
    const testingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        ServiceCatalogModule,
        FeaturesModule,
        OffersModule,
        PricingModule,
        SubscriptionsModule,
        ProvisioningModule,
        WorkspaceModule,
      ],
    }).compile();

    for (const controller of controllers) {
      expect(testingModule.get(controller)).toBeInstanceOf(controller);
    }

    await testingModule.close();
  });
});
