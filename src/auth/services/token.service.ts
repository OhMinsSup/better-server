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
   * @param {string} jwtSecret
   */
  getJwtToken(id: string, jwtSecret: string, payload?: Record<string, any>) {
    const expiresIn = this.env.getAccessTokenExpiresIn();
    return this.jwt.sign(
      {
        id,
        type: 'session',
        ...payload,
      },
      {
        expiresIn,
        secret: jwtSecret,
      },
    );
  }

  getJwtRefreshToken(
    id: string,
    tokenId: string,
    jwtSecret: string,
    payload?: Record<string, any>,
  ) {
    const expiresIn = this.env.getRefreshTokenExpiresIn();
    return this.jwt.sign(
      {
        id,
        type: 'refresh-token',
        ...payload,
      },
      {
        expiresIn,
        secret: jwtSecret,
        jwtid: tokenId,
      },
    );
  }

  /**
   * @description * 이메일에서 로그인할 때만 사용되는 임시 토큰 생성
   * @param {string} id
   * @param {string} jwtSecret
   */
  getEmailSignInToken(
    id: string,
    jwtSecret: string,
    payload?: Record<string, any>,
  ) {
    const expiresIn = this.env.getEmailTokenExpiresIn();
    return this.jwt.sign(
      {
        id,
        createdAt: new Date().toISOString(),
        type: 'email-signin',
        ...payload,
      },
      {
        expiresIn,
        secret: jwtSecret,
      },
    );
  }

  /**
   * @description rotateJwtSecret()에서 사용되는 랜덤한 JWT 시크릿을 현재 사용자에게 할당
   * @param {string} userId
   * @param {string} jwtSecret
   */
  rotateJwtSecret(userId: string, jwtSecret: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        jwtSecret,
      },
    });
  }
}
