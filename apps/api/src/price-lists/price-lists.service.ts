import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePriceListDto } from "./dto/create-price-list.dto";
import { UpdatePriceListDto } from "./dto/update-price-list.dto";
import { PriceListRecord, PriceListsRepository } from "./price-lists.repository";

@Injectable()
export class PriceListsService {
  constructor(private readonly priceListsRepository: PriceListsRepository) {}

  create(
    workspaceId: string,
    data: CreatePriceListDto,
  ): Promise<PriceListRecord> {
    return this.priceListsRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
      currencyCode: this.normalizeCurrencyCode(data.currencyCode),
    });
  }

  list(workspaceId: string): Promise<PriceListRecord[]> {
    return this.priceListsRepository.findByWorkspace(workspaceId);
  }

  async getByCode(workspaceId: string, code: string): Promise<PriceListRecord> {
    return this.requirePriceList(workspaceId, code);
  }

  async update(
    workspaceId: string,
    code: string,
    data: UpdatePriceListDto,
  ): Promise<PriceListRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requirePriceList(workspaceId, normalizedCode);

    return this.priceListsRepository.update(workspaceId, normalizedCode, {
      ...data,
      currencyCode: data.currencyCode
        ? this.normalizeCurrencyCode(data.currencyCode)
        : undefined,
    });
  }

  async deactivate(workspaceId: string, code: string): Promise<PriceListRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requirePriceList(workspaceId, normalizedCode);

    return this.priceListsRepository.deactivate(workspaceId, normalizedCode);
  }

  private async requirePriceList(
    workspaceId: string,
    code: string,
  ): Promise<PriceListRecord> {
    const normalizedCode = this.normalizeCode(code);
    const priceList = await this.priceListsRepository.findByWorkspaceAndCode(
      workspaceId,
      normalizedCode,
    );

    if (!priceList) {
      throw new NotFoundException(`Price list "${code}" not found`);
    }

    return priceList;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Price list code is required");
    }

    return normalizedCode;
  }

  private normalizeCurrencyCode(currencyCode: string): string {
    const normalizedCurrencyCode = currencyCode.trim().toUpperCase();

    if (normalizedCurrencyCode.length !== 3) {
      throw new BadRequestException("Currency code must use ISO-4217 format");
    }

    return normalizedCurrencyCode;
  }
}
