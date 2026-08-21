import { Test } from "@nestjs/testing";
import { PrismaModule } from "../../prisma/prisma.module";
import { WORKSPACE_CONTRACT } from "../../shared/contracts/workspace.contract";
import { WorkspaceModule } from "../workspace.module";
import { WorkspaceService } from "../workspace.service";

describe("Workspace public contract", () => {
  it("exports the Workspace service through its contract token", async () => {
    const testingModule = await Test.createTestingModule({
      imports: [PrismaModule, WorkspaceModule],
    }).compile();

    expect(testingModule.get(WORKSPACE_CONTRACT)).toBeInstanceOf(
      WorkspaceService,
    );

    await testingModule.close();
  });
});
