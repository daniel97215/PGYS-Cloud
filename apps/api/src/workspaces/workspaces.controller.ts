import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { WorkspacesService } from "./workspaces.service";

@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  findAll() {
    return this.workspacesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.workspacesService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateWorkspaceDto) {
    return this.workspacesService.create(data);
  }
}
