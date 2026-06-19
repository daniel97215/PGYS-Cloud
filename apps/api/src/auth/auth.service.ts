import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma, UserStatus } from "@prisma/client";
import * as argon2 from "argon2";
import { randomUUID } from "node:crypto";
import { durationToSeconds } from "../config/environment";
import { PrismaService } from "../prisma/prisma.service";
import {
  AccessTokenPayload,
  AuthenticatedUser,
  RefreshTokenPayload,
  RequestMetadata,
} from "./auth.types";
import {
  AccessTokenResponseDto,
  AuthResponseDto,
} from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  status: true,
  lastLoginAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: number;
  private readonly refreshExpiresIn: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.accessSecret = config.getOrThrow<string>("JWT_ACCESS_SECRET");
    this.refreshSecret = config.getOrThrow<string>("JWT_REFRESH_SECRET");
    this.accessExpiresIn = durationToSeconds(
      config.get<string>("JWT_ACCESS_EXPIRES_IN", "15m"),
    );
    this.refreshExpiresIn = durationToSeconds(
      config.get<string>("JWT_REFRESH_EXPIRES_IN", "30d"),
    );
  }

  async register(
    data: RegisterDto,
    metadata: RequestMetadata,
  ): Promise<AuthResponseDto> {
    const userId = randomUUID();
    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2id,
    });
    const session = await this.prepareSession(userId, metadata);

    try {
      const user = await this.prisma.$transaction(async (transaction) => {
        const createdUser = await transaction.user.create({
          data: {
            id: userId,
            email: data.email,
            passwordHash,
            status: UserStatus.ACTIVE,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            lastLoginAt: new Date(),
          },
          select: publicUserSelect,
        });

        await transaction.session.create({ data: session.data });
        return createdUser;
      });

      return this.createAuthResponse(user, session.refreshToken);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Email already registered");
      }

      throw error;
    }
  }

  async login(
    data: LoginDto,
    metadata: RequestMetadata,
  ): Promise<AuthResponseDto> {
    const userWithPassword = await this.prisma.user.findUnique({
      where: { email: data.email },
      select: { ...publicUserSelect, passwordHash: true },
    });

    if (
      !userWithPassword?.passwordHash ||
      userWithPassword.status !== UserStatus.ACTIVE ||
      !(await this.verifyHash(userWithPassword.passwordHash, data.password))
    ) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const session = await this.prepareSession(userWithPassword.id, metadata);
    const lastLoginAt = new Date();
    const [user] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userWithPassword.id },
        data: { lastLoginAt },
        select: publicUserSelect,
      }),
      this.prisma.session.create({ data: session.data }),
    ]);

    return this.createAuthResponse(user, session.refreshToken);
  }

  async refresh(refreshToken: string): Promise<AccessTokenResponseDto> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: { select: publicUserSelect } },
    });

    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.status !== UserStatus.ACTIVE ||
      !(await this.verifyHash(session.refreshTokenHash, refreshToken))
    ) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    return {
      accessToken: await this.signAccessToken(session.user),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
      select: {
        id: true,
        userId: true,
        refreshTokenHash: true,
        revokedAt: true,
      },
    });

    if (
      !session ||
      session.userId !== payload.sub ||
      !(await this.verifyHash(session.refreshTokenHash, refreshToken))
    ) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (!session.revokedAt) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  private async createAuthResponse(
    user: AuthenticatedUser,
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    return {
      accessToken: await this.signAccessToken(user),
      refreshToken,
      user,
    };
  }

  private signAccessToken(user: AuthenticatedUser): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      type: "access",
    };

    return this.jwt.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });
  }

  private async prepareSession(userId: string, metadata: RequestMetadata) {
    const sessionId = randomUUID();
    const payload: RefreshTokenPayload = {
      sub: userId,
      sessionId,
      type: "refresh",
    };
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });

    return {
      refreshToken,
      data: {
        id: sessionId,
        userId,
        refreshTokenHash: await argon2.hash(refreshToken, {
          type: argon2.argon2id,
        }),
        userAgent: metadata.userAgent?.slice(0, 512),
        ipAddress: metadata.ipAddress?.slice(0, 64),
        expiresAt: new Date(Date.now() + this.refreshExpiresIn * 1000),
      },
    };
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        { secret: this.refreshSecret },
      );

      if (
        payload.type !== "refresh" ||
        !payload.sub ||
        !payload.sessionId
      ) {
        throw new Error("Invalid token payload");
      }

      return payload;
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async verifyHash(hash: string, value: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, value);
    } catch {
      return false;
    }
  }
}
