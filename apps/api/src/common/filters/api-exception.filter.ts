import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Request, Response } from "express";

interface ErrorResponseBody {
  code?: unknown;
  details?: unknown;
  message?: unknown;
}

const ERROR_CODES: Readonly<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: "BAD_REQUEST",
  [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
  [HttpStatus.FORBIDDEN]: "FORBIDDEN",
  [HttpStatus.NOT_FOUND]: "NOT_FOUND",
  [HttpStatus.CONFLICT]: "CONFLICT",
  [HttpStatus.UNPROCESSABLE_ENTITY]: "UNPROCESSABLE_ENTITY",
  [HttpStatus.TOO_MANY_REQUESTS]: "TOO_MANY_REQUESTS",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "INTERNAL_SERVER_ERROR",
};

const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const correlationId = this.resolveCorrelationId(
      request.headers["x-correlation-id"],
    );
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = this.resolveBody(exception, status);

    response.setHeader("x-correlation-id", correlationId);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `Unhandled API error correlationId=${correlationId}`,
        stack,
      );
    }

    response.status(status).json({
      ...body,
      correlationId,
    });
  }

  private resolveBody(exception: unknown, status: number) {
    if (!(exception instanceof HttpException)) {
      return {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
        details: {},
      };
    }

    const response = exception.getResponse();
    const body =
      typeof response === "object" && response !== null
        ? (response as ErrorResponseBody)
        : undefined;
    const validationErrors = Array.isArray(body?.message)
      ? body.message.filter(
          (message): message is string => typeof message === "string",
        )
      : undefined;
    const customCode =
      typeof body?.code === "string" && ERROR_CODE_PATTERN.test(body.code)
        ? body.code
        : undefined;
    const code =
      customCode ??
      (validationErrors?.length
        ? "VALIDATION_ERROR"
        : (ERROR_CODES[status] ?? "HTTP_ERROR"));
    const message =
      validationErrors?.length
        ? "Validation failed"
        : typeof body?.message === "string"
          ? body.message
          : typeof response === "string"
            ? response
            : exception.message;
    const details =
      body?.details !== undefined
        ? body.details
        : validationErrors?.length
          ? { errors: validationErrors }
          : {};

    return { code, message, details };
  }

  private resolveCorrelationId(header: string | string[] | undefined): string {
    const candidate = Array.isArray(header) ? header[0] : header;
    return candidate && UUID_V4_PATTERN.test(candidate)
      ? candidate.toLowerCase()
      : randomUUID();
  }
}
