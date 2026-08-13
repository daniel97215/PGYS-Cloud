import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { WorkspaceStatus } from "@prisma/client";
import { FEATURE_STATUSES } from "../features/features.constants";
import { FeaturesRepository } from "../features/features.repository";
import { FeaturesService } from "../features/features.service";
import { OFFER_STATUSES } from "../offers/offers.constants";
import { OfferFeaturesRepository } from "../offers/offer-features.repository";
import { OfferFeaturesService } from "../offers/offer-features.service";
import { OffersRepository } from "../offers/offers.repository";
import { OffersService } from "../offers/offers.service";
import { PRICE_STATUSES } from "../pricing/pricing.constants";
import { PricingRepository } from "../pricing/pricing.repository";
import { PricingService } from "../pricing/pricing.service";
import {
  PROVISIONING_JOB_STATUS,
  PROVISIONING_OPERATION,
  ProvisioningOperation,
} from "../provisioning/provisioning.constants";
import { ProvisioningOrchestratorService } from "../provisioning/provisioning-orchestrator.service";
import { ProvisioningRepository } from "../provisioning/provisioning.repository";
import { ProvisioningService } from "../provisioning/provisioning.service";
import { SUBSCRIPTION_STATUSES } from "../subscriptions/subscriptions.constants";
import { SubscriptionsRepository } from "../subscriptions/subscriptions.repository";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { WORKSPACE_SERVICE_STATUSES } from "../workspace/workspace-services.constants";
import { WorkspaceServicesRepository } from "../workspace/workspace-services.repository";
import { WorkspaceServicesService } from "../workspace/workspace-services.service";
import { WorkspaceRepository } from "../workspace/workspace.repository";
import { WorkspaceService } from "../workspace/workspace.service";

interface CoreRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkspaceState extends CoreRecord {
  name: string;
  displayName: string;
  slug: string;
  status: WorkspaceStatus;
}

interface OfferState extends CoreRecord {
  key: string;
  name: string;
  status: string;
  visibility: string;
}

interface FeatureState extends CoreRecord {
  key: string;
  name: string;
  status: string;
}

interface PriceState extends CoreRecord {
  offerId: string;
  currency: string;
  amount: number;
  billingPeriod: string;
  validFrom: Date;
  status: string;
}

interface SubscriptionState extends CoreRecord {
  workspaceId: string;
  offerId: string;
  priceId: string | null;
  status: string;
  startedAt: Date;
  endsAt: Date | null;
  cancelledAt: Date | null;
  renewalDate: Date | null;
}

interface WorkspaceServiceState extends CoreRecord {
  workspaceId: string;
  serviceKey: string;
  status: string;
  configuration: object | null;
  activatedAt: Date | null;
  deactivatedAt: Date | null;
}

interface ProvisioningJobState extends CoreRecord {
  workspaceId: string;
  subscriptionId: string;
  operation: ProvisioningOperation;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  error: string | null;
}

describe("Core Workspace Onboarding integration", () => {
  const creatorId = "10000000-0000-4000-8000-000000000001";
  const now = new Date("2026-08-12T08:00:00.000Z");

  let sequence: number;
  let workspaces: WorkspaceState[];
  let offers: OfferState[];
  let features: FeatureState[];
  let prices: PriceState[];
  let subscriptions: SubscriptionState[];
  let workspaceServices: WorkspaceServiceState[];
  let provisioningJobs: ProvisioningJobState[];
  let offerFeatureLinks: Array<{
    id: string;
    offerId: string;
    featureId: string;
    enabled: boolean;
    createdAt: Date;
    offer: OfferState;
    feature: FeatureState;
  }>;

  let workspaceService: WorkspaceService;
  let offersService: OffersService;
  let featuresService: FeaturesService;
  let offerFeaturesService: OfferFeaturesService;
  let pricingService: PricingService;
  let subscriptionsService: SubscriptionsService;
  let workspaceServicesService: WorkspaceServicesService;
  let provisioningService: ProvisioningService;

  const nextId = () =>
    `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}`;

  beforeEach(() => {
    sequence = 0;
    workspaces = [];
    offers = [];
    features = [];
    prices = [];
    subscriptions = [];
    workspaceServices = [];
    provisioningJobs = [];
    offerFeatureLinks = [];

    const workspaceRepository = {
      slugExists: jest.fn(async (slug: string) =>
        workspaces.some((workspace) => workspace.slug === slug),
      ),
      createWithOwner: jest.fn(
        async (data: { name: string; slug: string }) => {
          const workspace: WorkspaceState = {
            id: nextId(),
            name: data.name,
            displayName: data.name,
            slug: data.slug,
            status: WorkspaceStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
          };
          workspaces.push(workspace);
          return workspace;
        },
      ),
    } as unknown as WorkspaceRepository;

    const offersRepository = {
      create: jest.fn(async (data: Omit<OfferState, keyof CoreRecord | "status" | "visibility"> & Partial<Pick<OfferState, "status" | "visibility">>) => {
        const offer = {
          id: nextId(),
          createdAt: now,
          updatedAt: now,
          status: OFFER_STATUSES.DRAFT,
          visibility: "public",
          ...data,
        };
        offers.push(offer);
        return offer;
      }),
      findByKey: jest.fn(async (key: string) =>
        offers.find((offer) => offer.key === key) ?? null,
      ),
      hasUsage: jest.fn(async (offerId: string) =>
        subscriptions.some((item) => item.offerId === offerId),
      ),
      hasActivePrice: jest.fn(async (offerId: string) =>
        prices.some(
          (price) =>
            price.offerId === offerId && price.status === PRICE_STATUSES.ACTIVE,
        ),
      ),
      transition: jest.fn(
        async (offerId: string, currentStatus: string, status: string) => {
          const offer = offers.find(
            (item) => item.id === offerId && item.status === currentStatus,
          );
          if (!offer) return null;
          offer.status = status;
          offer.updatedAt = now;
          return offer;
        },
      ),
    } as unknown as OffersRepository;

    const featuresRepository = {
      create: jest.fn(async (data: Omit<FeatureState, keyof CoreRecord>) => {
        const feature = {
          id: nextId(),
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        features.push(feature);
        return feature;
      }),
      findByKey: jest.fn(async (key: string) =>
        features.find((feature) => feature.key === key) ?? null,
      ),
    } as unknown as FeaturesRepository;

    const offerFeaturesRepository = {
      findOfferByKey: jest.fn(async (key: string) =>
        offers.find((offer) => offer.key === key) ?? null,
      ),
      findFeatureByKey: jest.fn(async (key: string) =>
        features.find((feature) => feature.key === key) ?? null,
      ),
      hasOfferUsage: jest.fn(async (offerId: string) =>
        subscriptions.some((item) => item.offerId === offerId),
      ),
      addFeatureToOffer: jest.fn(
        async (offerId: string, featureId: string) => {
          const existing = offerFeatureLinks.find(
            (link) => link.offerId === offerId && link.featureId === featureId,
          );
          if (existing) {
            existing.enabled = true;
            return existing;
          }
          const link = {
            id: nextId(),
            offerId,
            featureId,
            enabled: true,
            createdAt: now,
            offer: offers.find((offer) => offer.id === offerId)!,
            feature: features.find((feature) => feature.id === featureId)!,
          };
          offerFeatureLinks.push(link);
          return link;
        },
      ),
      findFeaturesByOffer: jest.fn(async (offerId: string) =>
        offerFeatureLinks.filter(
          (link) => link.offerId === offerId && link.enabled,
        ),
      ),
    } as unknown as OfferFeaturesRepository;

    const pricingRepository = {
      findOfferByKey: jest.fn(async (key: string) =>
        offers.find((offer) => offer.key === key) ?? null,
      ),
      findOfferById: jest.fn(async (id: string) =>
        offers.find((offer) => offer.id === id) ?? null,
      ),
      hasOfferUsage: jest.fn(async (offerId: string) =>
        subscriptions.some((item) => item.offerId === offerId),
      ),
      create: jest.fn(
        async (data: Omit<PriceState, keyof CoreRecord | "status">) => {
          const price: PriceState = {
            id: nextId(),
            createdAt: now,
            updatedAt: now,
            status: PRICE_STATUSES.ACTIVE,
            ...data,
          };
          prices.push(price);
          return price;
        },
      ),
      findActiveByOffer: jest.fn(async (offerId: string) =>
        prices.find(
          (price) =>
            price.offerId === offerId && price.status === PRICE_STATUSES.ACTIVE,
        ) ?? null,
      ),
    } as unknown as PricingRepository;

    const subscriptionsRepository = {
      findWorkspaceById: jest.fn(async (id: string) =>
        workspaces.find((workspace) => workspace.id === id) ?? null,
      ),
      findOfferByKey: jest.fn(async (key: string) =>
        offers.find((offer) => offer.key === key) ?? null,
      ),
      findPriceById: jest.fn(async (id: string) =>
        prices.find((price) => price.id === id) ?? null,
      ),
      findActiveByWorkspaceAndOffer: jest.fn(
        async (workspaceId: string, offerId: string) =>
          subscriptions.find(
            (subscription) =>
              subscription.workspaceId === workspaceId &&
              subscription.offerId === offerId &&
              subscription.status === SUBSCRIPTION_STATUSES.ACTIVE,
          ) ?? null,
      ),
      create: jest.fn(
        async (data: {
          workspaceId: string;
          offerId: string;
          priceId?: string;
          status?: string;
          startedAt: Date;
          endsAt?: Date;
          renewalDate?: Date;
        }) => {
          const subscription: SubscriptionState = {
            id: nextId(),
            createdAt: now,
            updatedAt: now,
            workspaceId: data.workspaceId,
            offerId: data.offerId,
            priceId: data.priceId ?? null,
            status: data.status ?? SUBSCRIPTION_STATUSES.PENDING,
            startedAt: data.startedAt,
            endsAt: data.endsAt ?? null,
            cancelledAt: null,
            renewalDate: data.renewalDate ?? null,
          };
          subscriptions.push(subscription);
          return subscription;
        },
      ),
      findById: jest.fn(async (id: string) =>
        subscriptions.find((subscription) => subscription.id === id) ?? null,
      ),
      update: jest.fn(async (id: string, data: Partial<SubscriptionState>) => {
        const subscription = subscriptions.find((item) => item.id === id)!;
        Object.assign(subscription, data, { updatedAt: now });
        return subscription;
      }),
    } as unknown as SubscriptionsRepository;

    const workspaceServicesRepository = {
      activate: jest.fn(
        async (workspaceId: string, serviceKey: string, configuration?: object) => {
          let service = workspaceServices.find(
            (item) =>
              item.workspaceId === workspaceId && item.serviceKey === serviceKey,
          );
          if (!service) {
            service = {
              id: nextId(),
              workspaceId,
              serviceKey,
              status: WORKSPACE_SERVICE_STATUSES.ACTIVE,
              configuration: configuration ?? null,
              activatedAt: now,
              deactivatedAt: null,
              createdAt: now,
              updatedAt: now,
            };
            workspaceServices.push(service);
          } else {
            Object.assign(service, {
              status: WORKSPACE_SERVICE_STATUSES.ACTIVE,
              configuration: configuration ?? service.configuration,
              activatedAt: now,
              deactivatedAt: null,
              updatedAt: now,
            });
          }
          return service;
        },
      ),
      findByWorkspace: jest.fn(async (workspaceId: string) =>
        workspaceServices.filter((service) => service.workspaceId === workspaceId),
      ),
    } as unknown as WorkspaceServicesRepository;

    const provisioningRepository = {
      findReusableJob: jest.fn(
        async (
          workspaceId: string,
          subscriptionId: string,
          operation: ProvisioningOperation,
        ) =>
          provisioningJobs.find(
            (job) =>
              job.workspaceId === workspaceId &&
              job.subscriptionId === subscriptionId &&
              job.operation === operation &&
              job.status === PROVISIONING_JOB_STATUS.COMPLETED,
          ) ?? null,
      ),
      createJob: jest.fn(
        async (data: {
          workspaceId: string;
          subscriptionId: string;
          operation: ProvisioningOperation;
          status?: string;
        }) => {
          const job: ProvisioningJobState = {
            id: nextId(),
            createdAt: now,
            updatedAt: now,
            workspaceId: data.workspaceId,
            subscriptionId: data.subscriptionId,
            operation: data.operation,
            status: data.status ?? PROVISIONING_JOB_STATUS.PENDING,
            startedAt: now,
            completedAt: null,
            error: null,
          };
          provisioningJobs.push(job);
          return job;
        },
      ),
      markRunning: jest.fn(async (id: string) =>
        updateJob(id, PROVISIONING_JOB_STATUS.RUNNING),
      ),
      markCompleted: jest.fn(async (id: string) =>
        updateJob(id, PROVISIONING_JOB_STATUS.COMPLETED),
      ),
      markFailed: jest.fn(async (id: string, error: string) =>
        updateJob(id, PROVISIONING_JOB_STATUS.FAILED, error),
      ),
      findSubscriptionById: jest.fn(async (id: string) =>
        subscriptions.find((subscription) => subscription.id === id) ?? null,
      ),
      findOfferById: jest.fn(async (id: string) =>
        offers.find((offer) => offer.id === id) ?? null,
      ),
      findOfferFeatures: jest.fn(async (offerId: string) =>
        offerFeatureLinks.filter(
          (link) => link.offerId === offerId && link.enabled,
        ),
      ),
      findWorkspaceServices: jest.fn(async (workspaceId: string) =>
        workspaceServices.filter((service) => service.workspaceId === workspaceId),
      ),
      findJobById: jest.fn(async (id: string) =>
        provisioningJobs.find((job) => job.id === id) ?? null,
      ),
    } as unknown as ProvisioningRepository;

    workspaceService = new WorkspaceService(workspaceRepository);
    offersService = new OffersService(offersRepository);
    featuresService = new FeaturesService(featuresRepository);
    offerFeaturesService = new OfferFeaturesService(offerFeaturesRepository);
    pricingService = new PricingService(pricingRepository);
    subscriptionsService = new SubscriptionsService(subscriptionsRepository);
    workspaceServicesService = new WorkspaceServicesService(
      workspaceServicesRepository,
    );
    const orchestrator = new ProvisioningOrchestratorService(
      provisioningRepository,
    );
    provisioningService = new ProvisioningService(
      provisioningRepository,
      orchestrator,
    );
  });

  function updateJob(id: string, status: string, error: string | null = null) {
    const job = provisioningJobs.find((item) => item.id === id)!;
    Object.assign(job, {
      status,
      error,
      completedAt:
        status === PROVISIONING_JOB_STATUS.COMPLETED ||
        status === PROVISIONING_JOB_STATUS.FAILED
          ? now
          : job.completedAt,
      updatedAt: now,
    });
    return job;
  }

  async function prepareOnboarding() {
    const workspace = await workspaceService.create(
      { name: "Acme France" },
      creatorId,
    );
    const offer = await offersService.createOffer({
      key: "crm-starter",
      name: "CRM Starter",
      visibility: "public",
    });
    const feature = await featuresService.createFeature({
      key: "crm.contacts",
      name: "CRM Contacts",
      status: FEATURE_STATUSES.ACTIVE,
    });
    await offerFeaturesService.addFeatureToOffer(offer.key, feature.key);
    const price = await pricingService.createPrice(offer.key, {
      currency: "EUR",
      amount: 29,
      billingPeriod: "monthly",
      validFrom: now,
      status: PRICE_STATUSES.ACTIVE,
    });
    await offersService.activateOffer(offer.key);
    const subscription = await subscriptionsService.createSubscription({
      workspaceId: workspace.id,
      offerKey: offer.key,
      priceId: price.id,
      startedAt: now,
      status: SUBSCRIPTION_STATUSES.ACTIVE,
    });
    await workspaceServicesService.enableService(workspace.id, "crm", {
      plan: "starter",
    });

    return { workspace, offer, feature, price, subscription };
  }

  it("completes onboarding and reuses provisioning without duplicating services", async () => {
    const { workspace, offer, feature, subscription } =
      await prepareOnboarding();

    const firstJob = await provisioningService.provisionWorkspace(workspace.id, {
      subscriptionId: subscription.id,
    });
    const replayedJob = await provisioningService.provisionWorkspace(
      workspace.id,
      { subscriptionId: subscription.id },
    );
    const enabledFeatures = await offerFeaturesService.listFeaturesForOffer(
      offer.key,
    );
    const enabledServices =
      await workspaceServicesService.listWorkspaceServices(workspace.id);

    expect(workspace.status).toBe(WorkspaceStatus.ACTIVE);
    expect(subscription.status).toBe(SUBSCRIPTION_STATUSES.ACTIVE);
    expect(firstJob.status).toBe(PROVISIONING_JOB_STATUS.COMPLETED);
    expect(replayedJob.id).toBe(firstJob.id);
    expect(enabledServices).toHaveLength(1);
    expect(enabledServices[0].status).toBe(WORKSPACE_SERVICE_STATUSES.ACTIVE);
    expect(enabledFeatures.map((link) => link.feature.key)).toEqual([
      feature.key,
    ]);
  });

  it("reprovisions an offer change then deprovisions a cancellation", async () => {
    const { workspace, subscription } = await prepareOnboarding();
    const nextOffer = await offersService.createOffer({
      key: "crm-pro",
      name: "CRM Pro",
      visibility: "public",
    });
    await pricingService.createPrice(nextOffer.key, {
      currency: "EUR",
      amount: 49,
      billingPeriod: "monthly",
      validFrom: now,
      status: PRICE_STATUSES.ACTIVE,
    });
    await offersService.activateOffer(nextOffer.key);

    const changed = await subscriptionsService.changeOffer(subscription.id, {
      offerKey: nextOffer.key,
    });
    const reprovisionJob = await provisioningService.reprovisionWorkspace(
      workspace.id,
      { subscriptionId: subscription.id },
    );
    const cancelled = await subscriptionsService.cancelSubscription(
      subscription.id,
      { cancelledAt: now },
    );
    const deprovisionJob = await provisioningService.deprovisionWorkspace(
      workspace.id,
      { subscriptionId: subscription.id },
    );

    expect(changed.offerId).toBe(nextOffer.id);
    expect(reprovisionJob.operation).toBe(
      PROVISIONING_OPERATION.REPROVISION,
    );
    expect(reprovisionJob.status).toBe(PROVISIONING_JOB_STATUS.COMPLETED);
    expect(cancelled.status).toBe(SUBSCRIPTION_STATUSES.CANCELLED);
    expect(deprovisionJob.operation).toBe(
      PROVISIONING_OPERATION.DEPROVISION,
    );
    expect(deprovisionJob.status).toBe(PROVISIONING_JOB_STATUS.COMPLETED);
  });

  it("rejects duplicate active subscriptions and cross-workspace provisioning", async () => {
    const { workspace, offer, price, subscription } = await prepareOnboarding();
    const otherWorkspace = await workspaceService.create(
      { name: "Other Workspace" },
      creatorId,
    );

    await expect(
      subscriptionsService.createSubscription({
        workspaceId: workspace.id,
        offerKey: offer.key,
        priceId: price.id,
        startedAt: now,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    await expect(
      provisioningService.provisionWorkspace(otherWorkspace.id, {
        subscriptionId: subscription.id,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(provisioningJobs).toHaveLength(1);
    expect(provisioningJobs[0].status).toBe(PROVISIONING_JOB_STATUS.FAILED);
    expect(provisioningJobs[0].error).toBe("Subscription not found");
  });

  it("rejects missing onboarding references and invalid service configuration", async () => {
    const workspace = await workspaceService.create(
      { name: "Acme France" },
      creatorId,
    );
    const offer = await offersService.createOffer({
      key: "crm-starter",
      name: "CRM Starter",
      visibility: "public",
    });
    await pricingService.createPrice(offer.key, {
      currency: "EUR",
      amount: 29,
      billingPeriod: "monthly",
      validFrom: now,
      status: PRICE_STATUSES.ACTIVE,
    });
    await offersService.activateOffer(offer.key);

    await expect(
      subscriptionsService.createSubscription({
        workspaceId: nextId(),
        offerKey: offer.key,
        startedAt: now,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      subscriptionsService.createSubscription({
        workspaceId: workspace.id,
        offerKey: "missing-offer",
        startedAt: now,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      subscriptionsService.createSubscription({
        workspaceId: workspace.id,
        offerKey: offer.key,
        priceId: nextId(),
        startedAt: now,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(() =>
      workspaceServicesService.enableService(workspace.id, "crm", []),
    ).toThrow(BadRequestException);

    expect(subscriptions).toHaveLength(0);
    expect(workspaceServices).toHaveLength(0);
    expect(provisioningJobs).toHaveLength(0);
  });
});
