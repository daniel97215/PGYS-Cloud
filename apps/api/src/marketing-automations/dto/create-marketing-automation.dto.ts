import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { MARKETING_AUTOMATION_ACTIONS, MARKETING_AUTOMATION_TRIGGERS, MarketingAutomationAction, MarketingAutomationTrigger } from "../marketing-automations.types";

const text = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim() : value;
const code = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateMarketingAutomationDto {
  @ApiProperty({ example: "NEW-PARTNER-WELCOME", maxLength: 40 })
  @Transform(code) @IsString() @MinLength(1) @MaxLength(40) @Matches(/^[A-Z0-9][A-Z0-9._-]*$/)
  code!: string;
  @ApiProperty({ maxLength: 120 }) @Transform(text) @IsString() @MinLength(1) @MaxLength(120)
  name!: string;
  @ApiPropertyOptional({ maxLength: 500 }) @Transform(text) @IsOptional() @IsString() @MaxLength(500)
  description?: string;
  @ApiProperty({ enum: MARKETING_AUTOMATION_TRIGGERS }) @IsIn(MARKETING_AUTOMATION_TRIGGERS)
  trigger!: MarketingAutomationTrigger;
  @ApiPropertyOptional({ enum: MARKETING_AUTOMATION_ACTIONS, default: "ENROLL_IN_CAMPAIGN" }) @IsOptional() @IsIn(MARKETING_AUTOMATION_ACTIONS)
  action?: MarketingAutomationAction;
  @ApiProperty({ format: "uuid" }) @IsUUID("4")
  campaignId!: string;
}
