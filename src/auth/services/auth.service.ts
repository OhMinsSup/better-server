import crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { DatabaseService } from '../../database/database.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { TokenService } from './token.service';

import { AnonymousInput } from '../dto/anonymous.input';

import { USER_SELECT } from '../select/user.select';
import { EXCEPTION_CODE } from '../../utils/exceptionCode';

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
  ) {}

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
      this._generateAccessTokenOpts(),
    );
    reply.setCookie(
      this.env.getRefreshTokenName(),
      tokens.refreshToken,
      this._generateRefreshTokenOpts(),
    );
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
            expiresAt: this._getRefreshTokenExpiresAt(),
          },
        });
        // 유저가 존재하면 토근 발급
        return {
          resultCode: EXCEPTION_CODE.OK,
          message: null,
          error: null,
          result: {
            accessToken: this.token.getJwtToken(
              userData.id,
              userData.jwtSecret,
              {
                isAnonymous: true,
              },
            ),
            refreshToken: this.token.getJwtRefreshToken(
              userData.id,
              refreshTokenData.id,
              userData.jwtSecret,
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
    const jwtSecret = await this._getRandomJwtSecret();
    // 유저 생성
    const userData = await this.prisma.user.create({
      data: {
        username: body.username,
        jwtSecret,
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
        expiresAt: this._getRefreshTokenExpiresAt(),
      },
    });

    // 유저 생성 후 토근 발급
    return {
      resultCode: EXCEPTION_CODE.OK,
      message: null,
      error: null,
      result: {
        accessToken: this.token.getJwtToken(userData.id, jwtSecret, {
          isAnonymous: true,
        }),
        refreshToken: this.token.getJwtRefreshToken(
          userData.id,
          refreshTokenData.id,
          jwtSecret,
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
   * @private
   * @description 익명 로그인 등록을 위한 유저 정보 생성
   */
  private async _makeAnonymousUser() {
    const count = await this.getCreateCount();
    const seed = `anonymous@${count}`;

    const { createAvatar } = await import('@dicebear/core');
    const { botttsNeutral } = await import('@dicebear/collection');

    const avatar = createAvatar(botttsNeutral, {
      seed,
    });

    const dataUrl = await avatar.toDataUri();

    const body = {
      username: seed,
      image: dataUrl,
    };

    return body;
  }

  /**
   * @private
   * @description JWT 비밀키 생성
   */
  private async _getRandomJwtSecret() {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * @private
   * @description 쿠키 refresh 토큰 만료 시간
   */
  private _getRefreshTokenExpiresAt() {
    const expiresIn = this.env.getRefreshTokenExpiresIn();
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    return expiresAt;
  }

  /**
   * @private
   * @description 쿠키 access 토큰 만료 시간
   */
  private _getAccessTokenExpiresAt() {
    const expiresIn = this.env.getAccessTokenExpiresIn();
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    return expiresAt;
  }

  /**
   * @private
   * @description 쿠키 refresh 토큰 옵션 생성
   */
  private _generateRefreshTokenOpts() {
    return {
      httpOnly: true,
      path: this.env.getCookiePath(),
      domain: this.env.getCookieDomain(),
      sameSite: this.env.getCookieSameSite(),
      expires: this._getRefreshTokenExpiresAt(),
    };
  }

  /**
   * @private
   * @description 쿠키 access 토큰 옵션 생성
   */
  private _generateAccessTokenOpts() {
    return {
      httpOnly: true,
      path: this.env.getCookiePath(),
      domain: this.env.getCookieDomain(),
      sameSite: this.env.getCookieSameSite(),
      expires: this._getAccessTokenExpiresAt(),
    };
  }
}
