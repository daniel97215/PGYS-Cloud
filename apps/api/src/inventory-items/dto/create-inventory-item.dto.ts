import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class CreateInventoryItemDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  warehouseId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  storageLocationId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  productId!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  productVariantId?: string;
}
