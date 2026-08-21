import { Test } from "@nestjs/testing";
import { PrismaModule } from "../../prisma/prisma.module";
import { PRICING_CONTRACT } from "../../shared/contracts/pricing.contract";
import { PricingModule } from "../pricing.module";
import { PricingService } from "../pricing.service";

describe("Pricing public contract", () => {
  it("exports the Pricing service through its contract token", async () => {
    const testingModule = await Test.createTestingModule({
      imports: [PrismaModule, PricingModule],
    }).compile();

    expect(testingModule.get(PRICING_CONTRACT)).toBeInstanceOf(PricingService);

    await testingModule.close();
  });
});
