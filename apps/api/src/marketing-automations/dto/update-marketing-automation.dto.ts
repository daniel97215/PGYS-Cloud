import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { MARKETING_AUTOMATION_TRIGGERS, MarketingAutomationTrigger } from "../marketing-automations.types";

const text = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim() : value;

export class UpdateMarketingAutomationDto {
  @ApiPropertyOptional({ maxLength: 120 }) @Transform(text) @IsOptional() @IsString() @MinLength(1) @MaxLength(120)
  name?: string;
  @ApiPropertyOptional({ maxLength: 500 }) @Transform(text) @IsOptional() @IsString() @MaxLength(500)
  description?: string;
  @ApiPropertyOptional({ enum: MARKETING_AUTOMATION_TRIGGERS }) @IsOptional() @IsIn(MARKETING_AUTOMATION_TRIGGERS)
  trigger?: MarketingAutomationTrigger;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID("4")
  campaignId?: string;
}
