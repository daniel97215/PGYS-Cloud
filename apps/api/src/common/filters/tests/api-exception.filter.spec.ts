import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  HttpStatus,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ApiExceptionFilter } from "../api-exception.filter";

const correlationId = "10000000-0000-4000-8000-000000000001";
const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function httpHost(incomingCorrelationId?: string) {
  const request = {
    headers: incomingCorrelationId
      ? { "x-correlation-id": incomingCorrelationId }
      : {},
  };
  const response = {
    json: jest.fn(),
    setHeader: jest.fn(),
    status: jest.fn(),
  };
  response.status.mockReturnValue(response);
  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
}

describe("ApiExceptionFilter", () => {
  let filter: ApiExceptionFilter;

  beforeEach(() => {
    filter = new ApiExceptionFilter();
  });

  it("formats a standard HTTP exception", () => {
    const { host, response } = httpHost(correlationId);

    filter.catch(new NotFoundException("Workspace not found"), host);

    expect(response.setHeader).toHaveBeenCalledWith(
      "x-correlation-id",
      correlationId,
    );
    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      code: "NOT_FOUND",
      correlationId,
      details: {},
      message: "Workspace not found",
    });
  });

  it("exposes validation messages as structured details", () => {
    const { host, response } = httpHost(correlationId);
    const messages = ["workspaceId must be a UUID"];

    filter.catch(
      new BadRequestException({
        error: "Bad Request",
        message: messages,
        statusCode: HttpStatus.BAD_REQUEST,
      }),
      host,
    );

    expect(response.json).toHaveBeenCalledWith({
      code: "VALIDATION_ERROR",
      correlationId,
      details: { errors: messages },
      message: "Validation failed",
    });
  });

  it("preserves an explicit stable code and safe details", () => {
    const { host, response } = httpHost(correlationId);

    filter.catch(
      new ConflictException({
        code: "ACTIVE_SUBSCRIPTION_EXISTS",
        details: { workspaceId: "workspace-id" },
        message: "An active subscription already exists",
      }),
      host,
    );

    expect(response.json).toHaveBeenCalledWith({
      code: "ACTIVE_SUBSCRIPTION_EXISTS",
      correlationId,
      details: { workspaceId: "workspace-id" },
      message: "An active subscription already exists",
    });
  });

  it("masks an unknown error and generates a correlation id", () => {
    const logger = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => undefined);
    const { host, response } = httpHost("invalid-correlation-id");

    filter.catch(new Error("database password leaked"), host);

    const generatedCorrelationId = response.setHeader.mock.calls[0]?.[1];
    expect(generatedCorrelationId).toEqual(expect.stringMatching(uuidV4Pattern));
    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith({
      code: "INTERNAL_SERVER_ERROR",
      correlationId: generatedCorrelationId,
      details: {},
      message: "Internal server error",
    });
    expect(response.json).not.toHaveBeenCalledWith(
      expect.objectContaining({ message: "database password leaked" }),
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining(`correlationId=${generatedCorrelationId}`),
      expect.any(String),
    );
  });
});
