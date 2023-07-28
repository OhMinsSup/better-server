import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly env: EnvironmentService,
    private readonly prisma: DatabaseService,
  ) {}

  /**
   * @description API 요청에 사용되어 저장된 세션 토큰을 반환합니다. 클라이언트 브라우저 쿠키에서 로그인 상태를 유지.
   * @param {string} id
   * @param {Record<string, any>?} payload
   */
  getJwtToken(id: string, payload?: Record<string, any>) {
    const expiresIn = this.env.getAccessTokenExpiresIn();
    const jwtSecret = this.env.getJwtSecret();
    const issuer = this.env.getJwtIssuer();
    return this.jwt.sign(
      {
        id,
        type: 'session',
        ...payload,
      },
      {
        expiresIn,
        issuer,
        secret: jwtSecret,
      },
    );
  }

  /**
   * @description refresh token 발급
   * @param {string} id
   * @param {string} tokenId
   * @param {Record<string, any>?} payload
   */
  getJwtRefreshToken(
    id: string,
    tokenId: string,
    payload?: Record<string, any>,
  ) {
    const expiresIn = this.env.getRefreshTokenExpiresIn();
    const jwtSecret = this.env.getJwtSecret();
    const issuer = this.env.getJwtIssuer();
    return this.jwt.sign(
      {
        id,
        type: 'refresh-token',
        ...payload,
      },
      {
        expiresIn,
        issuer,
        secret: jwtSecret,
        jwtid: tokenId,
      },
    );
  }

  /**
   * @description * 이메일에서 로그인할 때만 사용되는 임시 토큰 생성
   * @param {string} id
   * @param {Record<string, any>?} payload
   */
  getEmailSignInToken(id: string, payload?: Record<string, any>) {
    const expiresIn = this.env.getEmailTokenExpiresIn();
    const jwtSecret = this.env.getJwtSecret();
    const issuer = this.env.getJwtIssuer();
    return this.jwt.sign(
      {
        id,
        createdAt: new Date().toISOString(),
        type: 'email-signin',
        ...payload,
      },
      {
        expiresIn,
        issuer,
        secret: jwtSecret,
      },
    );
  }

  /**
   * @description 토큰 검증
   * @param {string} token
   */
  async verifyJwt(token: string) {
    try {
      const jwtSecret = this.env.getJwtSecret();
      return this.jwt.verifyAsync(
        token,
        jwtSecret ? { secret: jwtSecret } : undefined,
      );
    } catch (error) {
      throw error;
    }
  }
}
