import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CrmActivityType } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateCrmActivityDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  businessPartnerId!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  opportunityId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  contactId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  responsibleMemberId?: string;

  @ApiProperty({ enum: CrmActivityType, example: CrmActivityType.CALL })
  @IsEnum(CrmActivityType)
  type!: CrmActivityType;

  @ApiProperty({ example: "Qualification call", maxLength: 160 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
