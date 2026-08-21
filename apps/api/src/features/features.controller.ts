import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import {
  PlatformAdminOnly,
  PlatformOperatorReadAccess,
} from "../platform-administration/platform-access.decorators";
import { CreateFeatureDto } from "./dto/create-feature.dto";
import { UpdateFeatureDto } from "./dto/update-feature.dto";
import { FeaturesService } from "./features.service";

@ApiTags("Features")
@PlatformOperatorReadAccess()
@Controller("features")
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @ApiOperation({ summary: "Create a feature" })
  @ApiBody({ type: CreateFeatureDto })
  @ApiCreatedResponse({ description: "Feature created" })
  @PlatformAdminOnly()
  @Post()
  create(@Body() data: CreateFeatureDto) {
    return this.featuresService.createFeature(data);
  }

  @ApiOperation({ summary: "List features" })
  @ApiOkResponse({ description: "Features" })
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.featuresService.listFeatures(query);
  }

  @ApiOperation({ summary: "Get a feature by key" })
  @ApiParam({ name: "key" })
  @ApiOkResponse({ description: "Feature" })
  @ApiNotFoundResponse({ description: "Feature not found" })
  @Get(":key")
  findOne(@Param("key") key: string) {
    return this.featuresService.getFeature(key);
  }

  @ApiOperation({ summary: "Update a feature" })
  @ApiParam({ name: "key" })
  @ApiBody({ type: UpdateFeatureDto })
  @ApiOkResponse({ description: "Feature updated" })
  @ApiNotFoundResponse({ description: "Feature not found" })
  @PlatformAdminOnly()
  @Patch(":key")
  update(@Param("key") key: string, @Body() data: UpdateFeatureDto) {
    return this.featuresService.updateFeature(key, data);
  }

  @ApiOperation({ summary: "Archive a feature" })
  @ApiParam({ name: "key" })
  @ApiNoContentResponse({ description: "Feature archived" })
  @ApiNotFoundResponse({ description: "Feature not found" })
  @PlatformAdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":key")
  async archive(@Param("key") key: string): Promise<void> {
    await this.featuresService.archiveFeature(key);
  }
}
