import { Body, Controller, Post, Version } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { AnonymousInput } from '../dto/anonymous.input';
import { VersionStrategy } from 'src/utils/version';

@ApiTags('인증')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Version(VersionStrategy.current)
  @Post('anonymous')
  @ApiOperation({
    summary: '익명 로그인',
  })
  @ApiBody({
    required: true,
    description: '익명 로그인',
    type: AnonymousInput,
  })
  signInForAnonymous(@Body() input: AnonymousInput) {
    return this.service.signInForAnonymous(input);
  }

  @Post('sign-in')
  signIn() {
    return null;
  }
}
