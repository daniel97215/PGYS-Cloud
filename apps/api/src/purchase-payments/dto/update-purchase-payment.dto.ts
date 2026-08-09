import { PartialType } from "@nestjs/swagger";
import { CreatePurchasePaymentDto } from "./create-purchase-payment.dto";

export class UpdatePurchasePaymentDto extends PartialType(
  CreatePurchasePaymentDto,
) {}
