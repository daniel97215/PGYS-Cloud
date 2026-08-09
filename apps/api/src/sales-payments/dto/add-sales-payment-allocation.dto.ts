import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsPositive, IsUUID } from "class-validator";

export class AddSalesPaymentAllocationDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  salesInvoiceId!: string;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 4 })
  @IsPositive()
  amount!: number;
}
