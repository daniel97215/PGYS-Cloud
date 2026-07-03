import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { DeprovisionWorkspaceDto } from "./dto/deprovision-workspace.dto";
import { ProvisionWorkspaceDto } from "./dto/provision-workspace.dto";
import { ReprovisionWorkspaceDto } from "./dto/reprovision-workspace.dto";
import { ProvisioningService } from "./provisioning.service";

@ApiTags("Provisioning")
@Controller("provisioning")
export class ProvisioningController {
  constructor(private readonly provisioningService: ProvisioningService) {}

  @ApiOperation({ summary: "Start workspace provisioning" })
  @ApiParam({ name: "workspaceId" })
  @ApiBody({ type: ProvisionWorkspaceDto })
  @ApiCreatedResponse({ description: "Provisioning job" })
  @Post("workspaces/:workspaceId/provision")
  provision(
    @Param("workspaceId") workspaceId: string,
    @Body() data: ProvisionWorkspaceDto,
  ) {
    return this.provisioningService.provisionWorkspace(workspaceId, data);
  }

  @ApiOperation({ summary: "Start workspace reprovisioning" })
  @ApiParam({ name: "workspaceId" })
  @ApiBody({ type: ReprovisionWorkspaceDto })
  @ApiCreatedResponse({ description: "Provisioning job" })
  @Post("workspaces/:workspaceId/reprovision")
  reprovision(
    @Param("workspaceId") workspaceId: string,
    @Body() data: ReprovisionWorkspaceDto,
  ) {
    return this.provisioningService.reprovisionWorkspace(workspaceId, data);
  }

  @ApiOperation({ summary: "Start workspace deprovisioning" })
  @ApiParam({ name: "workspaceId" })
  @ApiBody({ type: DeprovisionWorkspaceDto })
  @ApiCreatedResponse({ description: "Provisioning job" })
  @Post("workspaces/:workspaceId/deprovision")
  deprovision(
    @Param("workspaceId") workspaceId: string,
    @Body() data: DeprovisionWorkspaceDto,
  ) {
    return this.provisioningService.deprovisionWorkspace(workspaceId, data);
  }

  @ApiOperation({ summary: "Get provisioning job status" })
  @ApiParam({ name: "jobId" })
  @ApiOkResponse({ description: "Provisioning job" })
  @ApiNotFoundResponse({ description: "Provisioning job not found" })
  @Get("jobs/:jobId")
  findOne(@Param("jobId") jobId: string) {
    return this.provisioningService.getProvisioningJob(jobId);
  }
}
