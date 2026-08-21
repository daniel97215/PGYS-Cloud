import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

const normalizeNumber = ({ value }: { value: unknown }) =>
  value === undefined || value === null || value === ""
    ? undefined
    : Number(value);

export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Transform(normalizeNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 25 })
  @Transform(normalizeNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
