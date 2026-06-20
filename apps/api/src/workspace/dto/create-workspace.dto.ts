import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateWorkspaceDto {
  @ApiProperty({ example: "Garage Martin", maxLength: 120 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: "contact@garage-martin.fr" })
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
}
