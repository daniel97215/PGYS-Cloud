import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsISO4217CurrencyCode,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import {
  IsIso6391Language,
  SIREN_PATTERN,
  SIRET_PATTERN,
  trimOptionalLowercaseString,
  trimOptionalString,
  trimOptionalUppercaseString,
  trimRequiredString,
} from "../validators/workspace-profile.validator";

export class UpdateWorkspaceProfileDto {
  @ApiPropertyOptional({ example: "Garage Martin", maxLength: 120 })
  @Transform(({ value }: { value: unknown }) => trimRequiredString(value))
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName?: string;

  @ApiPropertyOptional({
    example: "Garage Martin SARL",
    maxLength: 180,
    nullable: true,
  })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(180)
  legalName?: string | null;

  @ApiPropertyOptional({ example: "123456789", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @Matches(SIREN_PATTERN, {
    message: "siren must contain exactly 9 digits",
  })
  siren?: string | null;

  @ApiPropertyOptional({ example: "12345678900012", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @Matches(SIRET_PATTERN, {
    message: "siret must contain exactly 14 digits",
  })
  siret?: string | null;

  @ApiPropertyOptional({ example: "FR12345678901", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalUppercaseString(value))
  @IsOptional()
  @IsString()
  @MaxLength(32)
  vatNumber?: string | null;

  @ApiPropertyOptional({ example: "12 rue des Lilas", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(180)
  addressLine1?: string | null;

  @ApiPropertyOptional({ example: "Batiment B", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(180)
  addressLine2?: string | null;

  @ApiPropertyOptional({ example: "75001", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string | null;

  @ApiPropertyOptional({ example: "Paris", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string | null;

  @ApiPropertyOptional({ example: "France", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string | null;

  @ApiPropertyOptional({ example: "+33123456789", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @ApiPropertyOptional({ example: "https://garage-martin.fr", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  website?: string | null;

  @ApiPropertyOptional({
    example: "https://garage-martin.fr/logo.png",
    nullable: true,
  })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  logoUrl?: string | null;

  @ApiPropertyOptional({ example: "fr", nullable: true })
  @Transform(({ value }: { value: unknown }) =>
    trimOptionalLowercaseString(value),
  )
  @IsOptional()
  @IsIso6391Language()
  language?: string | null;

  @ApiPropertyOptional({ example: "Europe/Paris" })
  @Transform(({ value }: { value: unknown }) => trimRequiredString(value))
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @IsTimeZone()
  @MaxLength(80)
  timezone?: string;

  @ApiPropertyOptional({ example: "EUR", nullable: true })
  @Transform(({ value }: { value: unknown }) =>
    trimOptionalUppercaseString(value),
  )
  @IsOptional()
  @IsISO4217CurrencyCode()
  currency?: string | null;

  @ApiPropertyOptional({ example: "Reparation automobile", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  activity?: string | null;

  @ApiPropertyOptional({ example: "1-10", nullable: true })
  @Transform(({ value }: { value: unknown }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(80)
  companySize?: string | null;
}
