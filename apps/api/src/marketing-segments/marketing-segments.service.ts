import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BusinessPartnerAudienceCriteria,
  BusinessPartnerAudienceResult,
} from "../business-partner-search/business-partner-search.repository";
import { BusinessPartnerSearchService } from "../business-partner-search/business-partner-search.service";
import { CreateMarketingSegmentDto } from "./dto/create-marketing-segment.dto";
import { EvaluateMarketingSegmentDto } from "./dto/evaluate-marketing-segment.dto";
import { MarketingSegmentRulesDto } from "./dto/marketing-segment-rules.dto";
import { UpdateMarketingSegmentDto } from "./dto/update-marketing-segment.dto";
import {
  MarketingSegmentRecord,
  MarketingSegmentsRepository,
  UpdateMarketingSegmentData,
} from "./marketing-segments.repository";

export interface MarketingSegmentView {
  id: string;
  workspaceId: string;
  code: string;
  name: string;
  description: string | null;
  rules: BusinessPartnerAudienceCriteria;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketingSegmentEvaluationResult
  extends BusinessPartnerAudienceResult {
  segment: MarketingSegmentView;
}

@Injectable()
export class MarketingSegmentsService {
  constructor(
    private readonly repository: MarketingSegmentsRepository,
    private readonly businessPartnerSearchService: BusinessPartnerSearchService,
  ) {}

  async createSegment(
    workspaceId: string,
    data: CreateMarketingSegmentDto,
  ): Promise<MarketingSegmentView> {
    const code = this.normalizeCode(data.code);
    const existing = await this.repository.findByCode(workspaceId, code);

    if (existing) {
      throw new ConflictException(`Marketing segment "${code}" already exists`);
    }

    const rules = this.normalizeRules(data.rules);
    await this.validateRules(workspaceId, rules);
    const segment = await this.repository.create({
      workspaceId,
      code,
      name: data.name,
      description: data.description,
      ...rules,
      isActive: data.isActive,
    });

    return this.toView(segment);
  }

  async listSegments(workspaceId: string): Promise<MarketingSegmentView[]> {
    const segments = await this.repository.findByWorkspace(workspaceId);
    return segments.map((segment) => this.toView(segment));
  }

  async getSegment(
    workspaceId: string,
    code: string,
  ): Promise<MarketingSegmentView> {
    return this.toView(await this.requireSegment(workspaceId, code));
  }

  async updateSegment(
    workspaceId: string,
    code: string,
    data: UpdateMarketingSegmentDto,
  ): Promise<MarketingSegmentView> {
    const segment = await this.requireSegment(workspaceId, code);
    const update: UpdateMarketingSegmentData = {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
    };

    if (data.rules) {
      const rules = this.normalizeRules(data.rules);
      await this.validateRules(workspaceId, rules);
      Object.assign(update, rules);
    }

    return this.toView(
      await this.repository.update(workspaceId, segment.id, update),
    );
  }

  async deactivateSegment(workspaceId: string, code: string): Promise<void> {
    const segment = await this.requireSegment(workspaceId, code);
    await this.repository.deactivate(workspaceId, segment.id);
  }

  async evaluateSegment(
    workspaceId: string,
    code: string,
    pagination: EvaluateMarketingSegmentDto,
  ): Promise<MarketingSegmentEvaluationResult> {
    const segment = await this.requireSegment(workspaceId, code);

    if (!segment.isActive) {
      throw new BadRequestException("Marketing segment must be active to evaluate");
    }

    const rules = this.rulesFromRecord(segment);
    const result = await this.businessPartnerSearchService.evaluateAudience(
      workspaceId,
      rules,
      pagination,
    );

    return { segment: this.toView(segment), ...result };
  }

  private async requireSegment(
    workspaceId: string,
    code: string,
  ): Promise<MarketingSegmentRecord> {
    const normalizedCode = this.normalizeCode(code);
    const segment = await this.repository.findByCode(workspaceId, normalizedCode);

    if (!segment) {
      throw new NotFoundException(`Marketing segment "${code}" not found`);
    }

    return segment;
  }

  private async validateRules(
    workspaceId: string,
    rules: BusinessPartnerAudienceCriteria,
  ): Promise<void> {
    const known = await this.businessPartnerSearchService.findKnownAudienceCodes(
      workspaceId,
      rules,
    );
    const missing = [
      ...this.findMissing("roles", rules.roleCodes, known.roleCodes),
      ...this.findMissing(
        "categories",
        rules.categoryCodes,
        known.categoryCodes,
      ),
      ...this.findMissing("tags", rules.tagCodes, known.tagCodes),
    ];

    if (missing.length > 0) {
      throw new BadRequestException(
        `Unknown or inactive marketing segment criteria: ${missing.join(", ")}`,
      );
    }
  }

  private findMissing(label: string, expected: string[], known: string[]) {
    const knownCodes = new Set(known);
    return expected
      .filter((code) => !knownCodes.has(code))
      .map((code) => `${label}:${code}`);
  }

  private normalizeRules(
    rules: MarketingSegmentRulesDto,
  ): BusinessPartnerAudienceCriteria {
    return {
      roleCodes: this.normalizeCodes(rules.roleCodes),
      categoryCodes: this.normalizeCodes(rules.categoryCodes),
      tagCodes: this.normalizeCodes(rules.tagCodes),
      activeOnly: rules.activeOnly ?? false,
    };
  }

  private normalizeCodes(codes: string[] | undefined): string[] {
    return [...new Set((codes ?? []).map((code) => this.normalizeCode(code)))].sort();
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Marketing segment code is required");
    }

    return normalizedCode;
  }

  private rulesFromRecord(
    segment: MarketingSegmentRecord,
  ): BusinessPartnerAudienceCriteria {
    return {
      roleCodes: segment.roleCodes,
      categoryCodes: segment.categoryCodes,
      tagCodes: segment.tagCodes,
      activeOnly: segment.activeOnly,
    };
  }

  private toView(segment: MarketingSegmentRecord): MarketingSegmentView {
    return {
      id: segment.id,
      workspaceId: segment.workspaceId,
      code: segment.code,
      name: segment.name,
      description: segment.description,
      rules: this.rulesFromRecord(segment),
      isActive: segment.isActive,
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt,
    };
  }
}
