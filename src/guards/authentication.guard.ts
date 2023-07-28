import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentService } from '../integrations/environment/environment.service';
import { TokenService } from '../auth/services/token.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: DatabaseService,
    private readonly token: TokenService,
    private readonly env: EnvironmentService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    let token: string | null = null;

    const { authorization } = request.headers;

    // 토큰은 존재하지 않지만 헤더값에 authorization가 존재하는 경우
    // authorization에서 토큰이 존재하는 체크
    if (authorization) {
      const parts = authorization.split(' ');
      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        throw new ForbiddenException(
          `Bad Authorization header format. Format is "Authorization: Bearer <token>"`,
        );
      }
    } else {
      token = request.cookies[this.env.getAccessTokenName()];
    }

    if (!token) {
      return true;
    }

    return true;
  }
}
