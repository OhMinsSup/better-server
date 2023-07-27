import { Body, Controller, Post, Res, Version } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { AnonymousInput } from '../dto/anonymous.input';
import { VersionStrategy } from '../../utils/version';

import type { FastifyReply } from 'fastify';

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
  async signInForAnonymous(
    @Body() input: AnonymousInput,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const data = await this.service.signInForAnonymous(input);
    this.service.setCookies(reply, {
      accessToken: data.result.accessToken,
      refreshToken: data.result.refreshToken,
    });
    return data;
  }
}
