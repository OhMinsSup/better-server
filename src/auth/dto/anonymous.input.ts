import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AnonymousInput {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The username to use for the anonymous user',
    required: false,
    type: 'string',
  })
  username?: string;
}
