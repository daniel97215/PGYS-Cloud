import { BadRequestException, Injectable } from "@nestjs/common";
import {
  SendTransactionalSmsRequest,
  SendTransactionalSmsResponse,
} from "./sms-provider.contract";
import { SmsProviderConfigService } from "./sms-provider-config.service";
import { SmsProviderRegistryService } from "./sms-provider-registry.service";

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

@Injectable()
export class TransactionalSmsService {
  constructor(
    private readonly providerConfig: SmsProviderConfigService,
    private readonly providerRegistry: SmsProviderRegistryService,
  ) {}

  async send(
    request: SendTransactionalSmsRequest,
  ): Promise<SendTransactionalSmsResponse> {
    const normalized = this.normalizeRequest(request);
    const configuration = this.providerConfig.getConfiguration();
    const adapter = this.providerRegistry.get(configuration.provider);
    const response = await adapter.send({
      ...normalized,
      ...(configuration.from === undefined
        ? {}
        : { from: configuration.from }),
    });

    return {
      ...response,
      provider: adapter.providerId.trim().toUpperCase(),
    };
  }

  private normalizeRequest(
    request: SendTransactionalSmsRequest,
  ): SendTransactionalSmsRequest {
    const workspaceId = this.requiredText(
      request.workspaceId,
      "Workspace id",
      120,
    );
    const idempotencyKey = this.requiredText(
      request.idempotencyKey,
      "SMS idempotency key",
      120,
    );
    const to = request.to.trim();

    if (!E164_PATTERN.test(to)) {
      throw new BadRequestException("SMS recipient must use E.164 format");
    }

    return {
      workspaceId,
      idempotencyKey,
      to,
      text: this.requiredText(request.text, "SMS text content", 1_600),
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
