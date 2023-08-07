import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { SocialService } from './services/social.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TokenService, SocialService],
})
export class AuthModule {}
