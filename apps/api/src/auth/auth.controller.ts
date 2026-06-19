import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { AuthenticatedUser, RequestMetadata } from "./auth.types";
import {
  AccessTokenResponseDto,
  AuthResponseDto,
} from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { LogoutDto } from "./dto/logout.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(
    @Body() data: RegisterDto,
    @Req() request: Request,
  ): Promise<AuthResponseDto> {
    return this.authService.register(data, this.getMetadata(request));
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(
    @Body() data: LoginDto,
    @Req() request: Request,
  ): Promise<AuthResponseDto> {
    return this.authService.login(data, this.getMetadata(request));
  }

  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  refresh(@Body() data: RefreshDto): Promise<AccessTokenResponseDto> {
    return this.authService.refresh(data.refreshToken);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("logout")
  async logout(@Body() data: LogoutDto): Promise<void> {
    await this.authService.logout(data.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() request: AuthenticatedRequest): AuthenticatedUser {
    return request.user;
  }

  private getMetadata(request: Request): RequestMetadata {
    return {
      userAgent: request.get("user-agent"),
      ipAddress: request.ip,
    };
  }
}
