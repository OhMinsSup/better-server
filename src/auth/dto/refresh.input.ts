import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshInput {
  @IsString()
  @ApiProperty({
    description: 'The refresh token to use for the refresh',
    required: true,
    type: 'string',
  })
  refreshToken: string;
}
