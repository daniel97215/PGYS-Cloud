import { Test } from "@nestjs/testing";
import { PrismaModule } from "../../prisma/prisma.module";
import { OFFERS_CONTRACT } from "../../shared/contracts/offers.contract";
import { OffersModule } from "../offers.module";
import { OffersService } from "../offers.service";

describe("Offers public contract", () => {
  it("exports the Offers service through its contract token", async () => {
    const testingModule = await Test.createTestingModule({
      imports: [PrismaModule, OffersModule],
    }).compile();

    expect(testingModule.get(OFFERS_CONTRACT)).toBeInstanceOf(OffersService);

    await testingModule.close();
  });
});
