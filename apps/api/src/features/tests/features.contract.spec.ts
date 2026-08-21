import { Test } from "@nestjs/testing";
import { PrismaModule } from "../../prisma/prisma.module";
import { FEATURES_CONTRACT } from "../../shared/contracts/features.contract";
import { FeaturesModule } from "../features.module";
import { FeaturesService } from "../features.service";

describe("Features public contract", () => {
  it("exports the Features service through its contract token", async () => {
    const testingModule = await Test.createTestingModule({
      imports: [PrismaModule, FeaturesModule],
    }).compile();

    expect(testingModule.get(FEATURES_CONTRACT)).toBeInstanceOf(
      FeaturesService,
    );

    await testingModule.close();
  });
});
