import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class HealthService extends HealthIndicator {
  constructor(private readonly prisma: DatabaseService) {
    super();
  }

  async isDatabaseInstanceHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError('Prisma check failed', e);
    }
  }
}
