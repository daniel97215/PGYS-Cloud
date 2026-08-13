import { BadRequestException, Injectable } from "@nestjs/common";
import { isEmail } from "class-validator";
import {
  SendTransactionalEmailRequest,
  SendTransactionalEmailResponse,
} from "./email-provider.contract";
import { EmailProviderConfigService } from "./email-provider-config.service";
import { EmailProviderRegistryService } from "./email-provider-registry.service";

@Injectable()
export class TransactionalEmailService {
  constructor(
    private readonly providerConfig: EmailProviderConfigService,
    private readonly providerRegistry: EmailProviderRegistryService,
  ) {}

  async send(
    request: SendTransactionalEmailRequest,
  ): Promise<SendTransactionalEmailResponse> {
    const normalized = this.normalizeRequest(request);
    const configuration = this.providerConfig.getConfiguration();
    const adapter = this.providerRegistry.get(configuration.provider);
    const response = await adapter.send({
      ...normalized,
      from: configuration.sender,
    });

    return {
      ...response,
      provider: adapter.providerId.trim().toUpperCase(),
    };
  }

  private normalizeRequest(
    request: SendTransactionalEmailRequest,
  ): SendTransactionalEmailRequest {
    const workspaceId = this.requiredText(
      request.workspaceId,
      "Workspace id",
      120,
    );
    const idempotencyKey = this.requiredText(
      request.idempotencyKey,
      "Email idempotency key",
      120,
    );
    const to = request.to.trim().toLowerCase();

    if (!isEmail(to)) {
      throw new BadRequestException("Email recipient is invalid");
    }

    return {
      workspaceId,
      idempotencyKey,
      to,
      subject: this.requiredText(request.subject, "Email subject", 998),
      text: this.requiredText(request.text, "Email text content", 100_000),
      ...(request.html === undefined
        ? {}
        : {
            html: this.requiredText(
              request.html,
              "Email HTML content",
              500_000,
            ),
          }),
    };
  }

  private requiredText(
    value: string,
    label: string,
    maxLength: number,
  ): string {
    const normalized = value.trim();

    if (!normalized || normalized.length > maxLength) {
      throw new BadRequestException(`${label} is invalid`);
    }
    return normalized;
  }
}
