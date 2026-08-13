import { ServiceType } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { OvhHostingRepository } from "../ovh-hosting.repository";

describe("OvhHostingRepository", () => {
  it("finds only the HOSTING service in the requested workspace", async () => {
    const findFirst = jest.fn().mockResolvedValue({ id: "service-id" });
    const repository = new OvhHostingRepository({
      service: { findFirst },
    } as unknown as PrismaService);

    await repository.findWorkspaceHostingService(
      "workspace-id",
      "service-id",
    );

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: "service-id",
        workspaceId: "workspace-id",
        type: ServiceType.HOSTING,
      },
    });
  });
});
