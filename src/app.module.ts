import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { RateLimiterStrategy } from './utils/rateLimiter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot(RateLimiterStrategy.OneHundredPerMinute),
    IntegrationsModule,
    HealthModule,
    DatabaseModule,
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
