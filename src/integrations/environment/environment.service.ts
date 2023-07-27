import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {}

  getAccessTokenSecret(): string {
    return this.configService.get<string>('ACCESS_TOKEN_SECRET')!;
  }

  getAccessTokenExpiresIn(): string {
    return this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN')!;
  }

  getRefreshTokenSecret(): string {
    return this.configService.get<string>('REFRESH_TOKEN_SECRET')!;
  }

  getRefreshTokenExpiresIn(): string {
    return this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN')!;
  }

  getLoginTokenSecret(): string {
    return this.configService.get<string>('LOGIN_TOKEN_SECRET')!;
  }

  getLoginTokenExpiresIn(): string {
    return this.configService.get<string>('LOGIN_TOKEN_EXPIRES_IN')!;
  }

  getKakaoClientId(): string {
    return this.configService.get<string>('KAKAO_CLIENT_ID');
  }

  getKakaoClientSecret(): string {
    return this.configService.get<string>('KAKAO_CLIENT_SECRET');
  }
}
