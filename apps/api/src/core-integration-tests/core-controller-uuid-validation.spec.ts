import { ArgumentMetadata, ParseUUIDPipe } from "@nestjs/common";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { PricingController } from "../pricing/pricing.controller";
import { ProvisioningController } from "../provisioning/provisioning.controller";
import { SubscriptionsController } from "../subscriptions/subscriptions.controller";

interface RouteArgumentMetadata {
  data?: string;
  pipes?: unknown[];
}

const uuid = "10000000-0000-4000-8000-000000000001";

function uuidPipeFor(
  controller: object,
  methodName: string,
  parameterName: string,
): ParseUUIDPipe {
  const routeArguments = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    controller,
    methodName,
  ) as Record<string, RouteArgumentMetadata> | undefined;
  const argument = Object.values(routeArguments ?? {}).find(
    (candidate) => candidate.data === parameterName,
  );
  const pipe = argument?.pipes?.find(
    (candidate) => candidate instanceof ParseUUIDPipe,
  );

  if (!(pipe instanceof ParseUUIDPipe)) {
    throw new Error(
      `Missing ParseUUIDPipe for ${controller.constructor.name}.${methodName}(${parameterName})`,
    );
  }

  return pipe;
}

describe("Core controller UUID validation", () => {
  const routes = [
    [PricingController, "update", "priceId"],
    [PricingController, "archive", "priceId"],
    [SubscriptionsController, "findActive", "workspaceId"],
    [SubscriptionsController, "findAllForWorkspace", "workspaceId"],
    [SubscriptionsController, "changeOffer", "subscriptionId"],
    [SubscriptionsController, "suspend", "subscriptionId"],
    [SubscriptionsController, "reactivate", "subscriptionId"],
    [SubscriptionsController, "cancel", "subscriptionId"],
    [SubscriptionsController, "expire", "subscriptionId"],
    [ProvisioningController, "provision", "workspaceId"],
    [ProvisioningController, "reprovision", "workspaceId"],
    [ProvisioningController, "deprovision", "workspaceId"],
    [ProvisioningController, "findOne", "jobId"],
  ] as const;

  it.each(routes)(
    "%s.%s validates %s as a UUID v4",
    async (controller, methodName, parameterName) => {
      const pipe = uuidPipeFor(controller, methodName, parameterName);
      const metadata: ArgumentMetadata = {
        type: "param",
        metatype: String,
        data: parameterName,
      };

      await expect(pipe.transform(uuid, metadata)).resolves.toBe(uuid);
      await expect(
        pipe.transform("not-a-uuid", metadata),
      ).rejects.toMatchObject({ status: 400 });
      await expect(
        pipe.transform("10000000-0000-1000-8000-000000000001", metadata),
      ).rejects.toMatchObject({ status: 400 });
    },
  );
});
