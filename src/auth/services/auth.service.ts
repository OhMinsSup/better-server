import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';

import { DatabaseService } from '../../database/database.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { TokenService } from './token.service';
import { SocialService } from './social.service';

import { AnonymousInput } from '../dto/anonymous.input';
import { RefreshInput } from '../dto/refresh.input';
import { SocialQuery } from '../dto/social.query';

import { USER_SELECT } from '../select/user.select';
import { EXCEPTION_CODE } from '../../utils/exceptionCode';
import { assert } from '../../utils/assert';

import type { FastifyReply } from 'fastify';

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly env: EnvironmentService,
    private readonly token: TokenService,
    private readonly social: SocialService,
  ) {}

  /**
   * @public
   * @description 소셜 리다이렉트 URL 반환
   * @param {string} provider
   * @param {SocialQuery} query
   */
  getRedirectUrl(provider: string, query: SocialQuery) {
    const validated = ['kakao'].includes(provider);
    assert(validated, 'Invalid provider', BadRequestException);
    return this.social.generateSocialLoginLink(provider, query);
  }

  /**
   * @public
   * @description 토큰 재발급
   * @param {RefreshInput} input
   */
  async refresh(input: RefreshInput) {
    const { refreshToken } = input;
    const jwtPayload = await this.token.verifyJwt(refreshToken);
    // 토큰 타입이 refresh-token이 아닌 경우
    if (jwtPayload.type !== 'refresh-token') {
      return {
        resultCode: EXCEPTION_CODE.INVALID_TOKEN,
        message: 'Invalid token',
        error: 'Invalid token',
        result: null,
      };
    }
    // 토큰이 유효하지 않은 경우
    const tokenData = await this.prisma.refreshToken.findFirst({
      where: {
        id: jwtPayload.jti,
      },
    });

    assert(tokenData, "This refresh token doesn't exist", NotFoundException);

    const userData = await this.prisma.user.findUnique({
      where: {
        id: jwtPayload.id,
      },
      include: {
        refreshTokens: true,
      },
    });

    assert(userData, 'User not found', NotFoundException);

    if (tokenData.isRevoked) {
      // Revoke all user refresh tokens
      await this.prisma.refreshToken.updateMany({
        where: {
          id: {
            in: userData.refreshTokens.map(({ id }) => id),
          },
        },
        data: {
          isRevoked: true,
        },
      });
    }

    assert(
      !tokenData.isRevoked,
      'Suspicious activity detected, this refresh token has been revoked. All tokens has been revoked.',
      ForbiddenException,
    );

    const { id } = tokenData;

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: {
        id,
      },
      data: {
        isRevoked: true,
      },
    });

    const refreshTokenData = await this.prisma.refreshToken.create({
      data: {
        userId: userData.id,
        expiresAt: this.env.getRefreshTokenExpiresAt(),
      },
    });

    // 토큰 재발급
    const accessToken = this.token.getJwtToken(userData.id);
    const newRefreshToken = this.token.getJwtRefreshToken(
      userData.id,
      refreshTokenData.id,
    );

    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  /**
   * @public
   * @description 익명 로그인
   * @param {AnonymousInput} input
   */
  async signInForAnonymous(input: AnonymousInput) {
    const lastSignedInAt = new Date();
    const lastActiveAt = new Date();

    // 유저명을 입력한 경우
    if (input.username) {
      const userData = await this.prisma.user.findFirst({
        where: {
          username: input.username,
        },
        select: USER_SELECT,
      });

      if (userData) {
        const refreshTokenData = await this.prisma.refreshToken.create({
          data: {
            userId: userData.id,
            expiresAt: this.env.getRefreshTokenExpiresAt(),
          },
        });
        // 유저가 존재하면 토근 발급
        return {
          resultCode: EXCEPTION_CODE.OK,
          message: null,
          error: null,
          result: {
            accessToken: this.token.getJwtToken(userData.id, {
              isAnonymous: true,
            }),
            refreshToken: this.token.getJwtRefreshToken(
              userData.id,
              refreshTokenData.id,
              {
                isAnonymous: true,
              },
            ),
          },
        };
      }
      // 유저 정보가 없는 경우 게스트 생성 로직으로 진행
    }

    // 익명 유저 생성
    const body = await this._makeAnonymousUser();
    // 유저 수 증가
    await this.prisma.userCount.create({
      data: undefined,
    });
    // 유저 생성
    const userData = await this.prisma.user.create({
      data: {
        username: body.username,
        isAnonymous: true,
        lastActiveAt,
        lastSignedInAt,
        profile: {
          create: {
            image: body.image,
          },
        },
      },
    });

    const refreshTokenData = await this.prisma.refreshToken.create({
      data: {
        userId: userData.id,
        expiresAt: this.env.getRefreshTokenExpiresAt(),
      },
    });

    // 유저 생성 후 토근 발급
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        accessToken: this.token.getJwtToken(userData.id, {
          isAnonymous: true,
        }),
        refreshToken: this.token.getJwtRefreshToken(
          userData.id,
          refreshTokenData.id,
          {
            isAnonymous: true,
          },
        ),
      },
    };
  }

  /**
   * @public
   * @description 등록한 유저 총 수 (정지, 운영자 수 포함해서 계산)
   */
  async getCreateCount() {
    const counts = await this.prisma.userCount.findMany({
      // 제일 최신의 데이터만 가져옴
      take: 1,
      orderBy: {
        id: 'desc',
      },
    });
    return counts.at(0)?.id ?? 0;
  }

  /**
   * @public
   * @description 쿠키 설정
   * @param {FastifyReply} reply
   * @param {Tokens} tokens
   */
  setCookies(reply: FastifyReply, tokens: Tokens) {
    reply.setCookie(
      this.env.getAccessTokenName(),
      tokens.accessToken,
      this.env.generateAccessTokenOpts(),
    );
    reply.setCookie(
      this.env.getRefreshTokenName(),
      tokens.refreshToken,
      this.env.generateRefreshTokenOpts(),
    );
  }

  /**
   * @private
   * @description 익명 로그인 등록을 위한 유저 정보 생성
   */
  private async _makeAnonymousUser() {
    const count = await this.getCreateCount();
    const seed = `anonymous@${count}`;
    const { data: svgData } = await axios.get(
      'https://api.dicebear.com/6.x/bottts-neutral/svg',
      {
        params: {
          seed,
        },
        responseType: 'blob',
      },
    );
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgData).toString(
      'base64',
    )}`;
    const body = {
      username: seed,
      image: dataUrl,
    };
    return body;
  }
}
