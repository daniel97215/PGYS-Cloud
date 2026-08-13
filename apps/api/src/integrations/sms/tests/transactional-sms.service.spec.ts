import { BadRequestException } from "@nestjs/common";
import { SMS_DELIVERY_STATUS } from "../sms.constants";
import { SmsProviderAdapter } from "../sms-provider.contract";
import { SmsProviderConfigService } from "../sms-provider-config.service";
import { SmsProviderRegistryService } from "../sms-provider-registry.service";
import { TransactionalSmsService } from "../transactional-sms.service";

describe("TransactionalSmsService", () => {
  let adapter: jest.Mocked<SmsProviderAdapter>;
  let service: TransactionalSmsService;

  beforeEach(() => {
    adapter = {
      providerId: "PROVIDER-A",
      send: jest.fn().mockResolvedValue({
        status: SMS_DELIVERY_STATUS.ACCEPTED,
        externalReference: "external-a",
      }),
    };
    const configuration = {
      getConfiguration: jest.fn().mockReturnValue({
        provider: "PROVIDER-A",
        from: "PGYS",
      }),
    } as unknown as SmsProviderConfigService;
    const registry = {
      get: jest.fn().mockReturnValue(adapter),
    } as unknown as SmsProviderRegistryService;

    service = new TransactionalSmsService(configuration, registry);
  });

  it("normalizes and sends one transactional SMS", async () => {
    const result = await service.send({
      workspaceId: " workspace-a ",
      idempotencyKey: " appointment-1-reminder ",
      to: " +33601020304 ",
      text: " Your appointment is tomorrow. ",
    });

    expect(adapter.send).toHaveBeenCalledWith({
      workspaceId: "workspace-a",
      idempotencyKey: "appointment-1-reminder",
      to: "+33601020304",
      text: "Your appointment is tomorrow.",
      from: "PGYS",
    });
    expect(result).toEqual({
      status: SMS_DELIVERY_STATUS.ACCEPTED,
      provider: "PROVIDER-A",
      externalReference: "external-a",
    });
  });

  it.each([
    ["Workspace", { workspaceId: " " }],
    ["idempotency key", { idempotencyKey: " " }],
    ["recipient", { to: "0601020304" }],
    ["recipient country code", { to: "+0123456789" }],
    ["text content", { text: " " }],
    ["text length", { text: "X".repeat(1_601) }],
  ])("rejects an invalid %s", async (_label, override) => {
    await expect(
      service.send({
        workspaceId: "workspace-a",
        idempotencyKey: "message-a",
        to: "+33601020304",
        text: "Content",
        ...override,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(adapter.send).not.toHaveBeenCalled();
  });

  it("does not invent persistence or retry behavior for provider failures", async () => {
    const providerError = new Error("provider unavailable");
    adapter.send.mockRejectedValueOnce(providerError);

    await expect(
      service.send({
        workspaceId: "workspace-a",
        idempotencyKey: "message-a",
        to: "+33601020304",
        text: "Content",
      }),
    ).rejects.toBe(providerError);
  });
});
