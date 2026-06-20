import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({ example: "Garage Martin & Fils", maxLength: 120 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: "facturation@garage-martin.fr" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  billingEmail?: string;

  @ApiPropertyOptional({ example: "+33123456789" })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: "fr-FR" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  locale?: string;

  @ApiPropertyOptional({ example: "Europe/Paris" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  timezone?: string;
}
