import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class HealthService extends HealthIndicator {
  constructor() {
    super();
  }

  async isDatabaseInstanceHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError('Prisma check failed', e);
    }
  }
}
