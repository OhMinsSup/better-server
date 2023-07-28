import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';

import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { RateLimiterStrategy } from './utils/rateLimiter';
import { AuthenticationGuardModule } from './guards/authentication.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot(RateLimiterStrategy.OneHundredPerMinute),
    IntegrationsModule,
    JwtModule.register({
      global: true,
    }),
    AuthenticationGuardModule,
    HealthModule,
    DatabaseModule,
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
