import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';

import { AnonymousInput } from '../dto/anonymous.input';
import { RefreshInput } from '../dto/refresh.input';
import { SocialQuery } from '../dto/social.query';

import type { FastifyReply } from 'fastify';

@ApiTags('인증')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('redirect/:provider')
  @ApiOperation({
    summary: '소셜 로그인 리다이렉트',
  })
  @ApiQuery({
    required: false,
    description: '소셜 로그인 쿼리스트링',
    type: SocialQuery,
  })
  async redirect(
    @Res() reply: FastifyReply,
    @Param('provider') provider: string,
    @Query() query: SocialQuery,
  ) {
    const link = this.service.getRedirectUrl(provider, query);
    reply.status(302).redirect(link);
  }

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
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() input: AnonymousInput,
  ) {
    const data = await this.service.signInForAnonymous(input);
    this.service.setCookies(reply, {
      accessToken: data.result.accessToken,
      refreshToken: data.result.refreshToken,
    });
    return data;
  }

  @Post('refresh')
  @ApiOperation({
    summary: '토큰 재발급',
  })
  @ApiBody({
    required: true,
    description: '익명 로그인',
    type: RefreshInput,
  })
  async refresh(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() input: RefreshInput,
  ) {
    const data = await this.service.refresh(input);
    this.service.setCookies(reply, {
      accessToken: data.result.accessToken,
      refreshToken: data.result.refreshToken,
    });
    return data;
  }
}
