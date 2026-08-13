import { BadRequestException } from "@nestjs/common";
import { EMAIL_DELIVERY_STATUS } from "../email.constants";
import { EmailProviderAdapter } from "../email-provider.contract";
import { EmailProviderConfigService } from "../email-provider-config.service";
import { EmailProviderRegistryService } from "../email-provider-registry.service";
import { TransactionalEmailService } from "../transactional-email.service";

describe("TransactionalEmailService", () => {
  let adapter: jest.Mocked<EmailProviderAdapter>;
  let service: TransactionalEmailService;

  beforeEach(() => {
    adapter = {
      providerId: "PROVIDER-A",
      send: jest.fn().mockResolvedValue({
        status: EMAIL_DELIVERY_STATUS.ACCEPTED,
        externalReference: "external-a",
      }),
    };
    const configuration = {
      getConfiguration: jest.fn().mockReturnValue({
        provider: "PROVIDER-A",
        sender: {
          address: "noreply@example.com",
          name: "PGYS",
        },
      }),
    } as unknown as EmailProviderConfigService;
    const registry = {
      get: jest.fn().mockReturnValue(adapter),
    } as unknown as EmailProviderRegistryService;

    service = new TransactionalEmailService(configuration, registry);
  });

  it("normalizes and sends one transactional email", async () => {
    const result = await service.send({
      workspaceId: " workspace-a ",
      idempotencyKey: " invoice-1-issued ",
      to: " CUSTOMER@EXAMPLE.COM ",
      subject: " Invoice available ",
      text: " Your invoice is available. ",
      html: " <p>Your invoice is available.</p> ",
    });

    expect(adapter.send).toHaveBeenCalledWith({
      workspaceId: "workspace-a",
      idempotencyKey: "invoice-1-issued",
      to: "customer@example.com",
      subject: "Invoice available",
      text: "Your invoice is available.",
      html: "<p>Your invoice is available.</p>",
      from: {
        address: "noreply@example.com",
        name: "PGYS",
      },
    });
    expect(result).toEqual({
      status: EMAIL_DELIVERY_STATUS.ACCEPTED,
      provider: "PROVIDER-A",
      externalReference: "external-a",
    });
  });

  it.each([
    ["Workspace", { workspaceId: " " }],
    ["idempotency key", { idempotencyKey: " " }],
    ["recipient", { to: "invalid" }],
    ["subject", { subject: " " }],
    ["text content", { text: " " }],
  ])("rejects an invalid %s", async (_label, override) => {
    await expect(
      service.send({
        workspaceId: "workspace-a",
        idempotencyKey: "message-a",
        to: "customer@example.com",
        subject: "Subject",
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
        to: "customer@example.com",
        subject: "Subject",
        text: "Content",
      }),
    ).rejects.toBe(providerError);
  });
});
