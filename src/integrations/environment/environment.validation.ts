import { plainToClass } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import { assert } from '../../utils/assert';
import { IsDuration } from './decorators/is-duration.decorator';

export class EnvironmentVariables {
  // Database
  @IsString()
  DATABASE_URL: string;

  // Cookie
  @IsString()
  COOKIE_SECRET: string;

  @IsString()
  ACCESS_TOKEN_NAME: string;

  @IsString()
  REFRESH_TOKEN_NAME: string;

  @IsString()
  COOKIE_PATH: string;

  @IsString()
  COOKIE_SAMESITE: string;

  @IsString()
  COOKIE_DOMAIN: string;

  // Jwt
  @IsDuration()
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsDuration()
  REFRESH_TOKEN_EXPIRES_IN: string;

  @IsDuration()
  EMAIL_TOKEN_EXPIRES_IN: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_ISSUER: string;

  // Auth
  @IsString()
  KAKAO_CLIENT_ID: string;

  @IsString()
  KAKAO_CLIENT_SECRET: string;

  @IsString()
  KAKAO_CALLBACK_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig);
  assert(!errors.length, errors.toString());

  return validatedConfig;
}
