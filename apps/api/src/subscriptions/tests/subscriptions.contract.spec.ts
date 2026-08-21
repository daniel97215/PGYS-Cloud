import { Test } from "@nestjs/testing";
import { PrismaModule } from "../../prisma/prisma.module";
import { SUBSCRIPTIONS_CONTRACT } from "../../shared/contracts/subscriptions.contract";
import { SubscriptionsModule } from "../subscriptions.module";
import { SubscriptionsService } from "../subscriptions.service";

describe("Subscriptions public contract", () => {
  it("exports the Subscriptions service through its contract token", async () => {
    const testingModule = await Test.createTestingModule({
      imports: [PrismaModule, SubscriptionsModule],
    }).compile();

    expect(testingModule.get(SUBSCRIPTIONS_CONTRACT)).toBeInstanceOf(
      SubscriptionsService,
    );

    await testingModule.close();
  });
});
