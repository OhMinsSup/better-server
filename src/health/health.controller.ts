import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthService } from './health.service';

@SkipThrottle()
@Controller({
  path: 'api/health',
  version: VERSION_NEUTRAL,
})
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private readonly service: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.service.isDatabaseInstanceHealthy('database'),
    ]);
  }
}
