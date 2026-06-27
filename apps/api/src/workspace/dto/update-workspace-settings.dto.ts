import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsISO4217CurrencyCode,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsTimeZone,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import {
  IsIso6391Language,
  trimRequiredString,
} from "../validators/workspace-profile.validator";

export class UpdateWorkspaceGeneralSettingsDto {
  @ApiPropertyOptional({ example: "fr" })
  @Transform(({ value }: { value: unknown }) => {
    const trimmed = trimRequiredString(value);
    return typeof trimmed === "string" ? trimmed.toLowerCase() : trimmed;
  })
  @IsOptional()
  @IsIso6391Language()
  language?: string;

  @ApiPropertyOptional({ example: "Europe/Paris" })
  @Transform(({ value }: { value: unknown }) => trimRequiredString(value))
  @IsOptional()
  @IsString()
  @IsTimeZone()
  @MaxLength(80)
  timezone?: string;

  @ApiPropertyOptional({ example: "EUR" })
  @Transform(({ value }: { value: unknown }) => {
    const trimmed = trimRequiredString(value);
    return typeof trimmed === "string" ? trimmed.toUpperCase() : trimmed;
  })
  @IsOptional()
  @IsISO4217CurrencyCode()
  currency?: string;
}

export class UpdateWorkspaceSecuritySettingsDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  requireMfa?: boolean;

  @ApiPropertyOptional({ example: 480, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sessionTimeoutMinutes?: number;
}

export class UpdateWorkspacePreferencesSettingsDto {
  @ApiPropertyOptional({ example: "dd/MM/yyyy", maxLength: 32 })
  @Transform(({ value }: { value: unknown }) => trimRequiredString(value))
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  dateFormat?: string;

  @ApiPropertyOptional({ example: "HH:mm", maxLength: 32 })
  @Transform(({ value }: { value: unknown }) => trimRequiredString(value))
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  timeFormat?: string;
}

export class UpdateWorkspaceSettingsDto {
  @ApiPropertyOptional({ type: UpdateWorkspaceGeneralSettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateWorkspaceGeneralSettingsDto)
  general?: UpdateWorkspaceGeneralSettingsDto;

  @ApiPropertyOptional({ type: UpdateWorkspaceSecuritySettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateWorkspaceSecuritySettingsDto)
  security?: UpdateWorkspaceSecuritySettingsDto;

  @ApiPropertyOptional({ type: UpdateWorkspacePreferencesSettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateWorkspacePreferencesSettingsDto)
  preferences?: UpdateWorkspacePreferencesSettingsDto;
}
