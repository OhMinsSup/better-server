import { plainToClass } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';
import { assert } from '../../utils/assert';

export class EnvironmentVariables {
  // Database
  //   @IsUrl({ protocols: ['file'], require_tld: false })
  @IsString()
  DATABASE_URL: string;

  // Auth
  @IsString()
  KAKAO_CLIENT_ID?: string;

  @IsString()
  KAKAO_CLIENT_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig);
  assert(!errors.length, errors.toString());

  return validatedConfig;
}
