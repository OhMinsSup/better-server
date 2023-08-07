import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class SocialQuery {
  @IsOptional()
  @IsString()
  next?: string;

  @IsOptional()
  @IsBooleanString()
  isIntegrate?: string;

  @IsOptional()
  @IsString()
  integrateState?: string;
}
