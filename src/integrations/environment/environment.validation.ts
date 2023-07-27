import { plainToClass } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import { assert } from '../../utils/assert';
import { IsDuration } from './decorators/is-duration.decorator';

export class EnvironmentVariables {
  // Database
  @IsString()
  DATABASE_URL: string;

  // Jwt
  @IsString()
  ACCESS_TOKEN_SECRET: string;
  @IsDuration()
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;
  @IsDuration()
  REFRESH_TOKEN_EXPIRES_IN: string;

  @IsString()
  LOGIN_TOKEN_SECRET: string;
  @IsDuration()
  LOGIN_TOKEN_EXPIRES_IN: string;

  // Auth
  @IsString()
  KAKAO_CLIENT_ID: string;

  @IsString()
  KAKAO_CLIENT_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig);
  assert(!errors.length, errors.toString());

  return validatedConfig;
}
