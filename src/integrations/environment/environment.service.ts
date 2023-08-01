import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';

@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {}

  //  cookie
  getCookieSecret(): string {
    return this.configService.get<string>('COOKIE_SECRET');
  }

  getAccessTokenName(): string {
    return this.configService.get<string>('ACCESS_TOKEN_NAME');
  }

  getRefreshTokenName(): string {
    return this.configService.get<string>('REFRESH_TOKEN_NAME');
  }

  getCookiePath(): string {
    return this.configService.get<string>('COOKIE_PATH');
  }

  getCookieSameSite(): 'lax' | 'none' | 'strict' {
    return this.configService.get<'lax' | 'none' | 'strict'>('COOKIE_SAMESITE');
  }

  getCookieDomain(): string {
    return this.configService.get<string>('COOKIE_DOMAIN');
  }

  // jwt

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  getJwtIssuer(): string {
    return this.configService.get<string>('JWT_ISSUER');
  }

  getAccessTokenExpiresIn(): string {
    return this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN');
  }

  getRefreshTokenExpiresIn(): string {
    return this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN');
  }

  getEmailTokenExpiresIn(): string {
    return this.configService.get<string>('EMAIL_TOKEN_EXPIRES_IN');
  }

  // kakao

  getKakaoClientId(): string {
    return this.configService.get<string>('KAKAO_CLIENT_ID');
  }

  getKakaoCallbackUrl(): string {
    return this.configService.get<string>('KAKAO_CALLBACK_URL');
  }

  getKakaoClientSecret(): string {
    return this.configService.get<string>('KAKAO_CLIENT_SECRET');
  }

  // etc

  getRefreshTokenExpiresAt() {
    const expiresIn = this.getRefreshTokenExpiresIn();
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    return expiresAt;
  }

  getAccessTokenExpiresAt() {
    const expiresIn = this.getAccessTokenExpiresIn();
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    return expiresAt;
  }

  generateRefreshTokenOpts() {
    return {
      httpOnly: true,
      path: this.getCookiePath(),
      domain: this.getCookieDomain(),
      sameSite: this.getCookieSameSite(),
      expires: this.getRefreshTokenExpiresAt(),
    };
  }

  generateAccessTokenOpts() {
    return {
      httpOnly: true,
      path: this.getCookiePath(),
      domain: this.getCookieDomain(),
      sameSite: this.getCookieSameSite(),
      expires: this.getAccessTokenExpiresAt(),
    };
  }
}
