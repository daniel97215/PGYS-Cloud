import { Injectable } from "@nestjs/common";
import { Prisma, ServiceType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export type OvhWorkspaceHostingServiceRecord =
  Prisma.ServiceGetPayload<object>;

@Injectable()
export class OvhHostingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findWorkspaceHostingService(
    workspaceId: string,
    workspaceServiceId: string,
  ): Promise<OvhWorkspaceHostingServiceRecord | null> {
    return this.prisma.service.findFirst({
      where: {
        id: workspaceServiceId,
        workspaceId,
        type: ServiceType.HOSTING,
      },
    });
  }
}
