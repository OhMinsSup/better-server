import { Injectable } from '@nestjs/common';
import { createAvatar } from '@dicebear/core';
import { botttsNeutral } from '@dicebear/collection';

import { DatabaseService } from '../../database/database.service';
import { EnvironmentService } from '../../integrations/environment/environment.service';

import { AnonymousInput } from '../dto/anonymous.input';

import { USER_SELECT } from '../select/user.select';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly env: EnvironmentService,
  ) {}

  /**
   * @public
   * @description 익명 로그인
   * @param {AnonymousInput} input
   */
  async signInForAnonymous(input: AnonymousInput) {
    // 유저명을 입력한 경우
    if (input.username) {
      const data = await this.prisma.user.findFirst({
        where: {
          username: input.username,
        },
        select: USER_SELECT,
      });

      if (data) {
        const lastSignedInAt = new Date();
        const lastActiveAt = new Date();
        return;
      }
      // 유저 정보가 없는 경우 게스트 생성 로직으로 진행
    }

    const lastSignedInAt = new Date();
    const lastActiveAt = new Date();
    // 유저 수 증가
    await this.prisma.userCount.create({});
    // 익명 유저 생성
    const body = await this._makeAnonymousUser();
    // 유저 생성
    const data = await this.prisma.user.create({
      data: {
        username: body.username,
        isAnonymous: true,
        lastActiveAt,
        lastSignedInAt,
        profile: {
          create: {
            image: body.image,
          },
        },
      },
    });
    console.log(data);
    return;
  }

  /**
   * @public
   * @description 등록한 유저 총 수 (정지, 운영자 수 포함해서 계산)
   */
  async getCreateCount() {
    const counts = await this.prisma.userCount.findMany({
      // 제일 최신의 데이터만 가져옴
      take: 1,
      orderBy: {
        id: 'desc',
      },
    });
    return counts.at(0)?.id;
  }

  /**
   * @private
   * @description 익명 로그인 등록을 위한 유저 정보 생성
   */
  private async _makeAnonymousUser() {
    const count = await this.getCreateCount();
    const seed = `anonymous@${count}`;

    const avatar = createAvatar(botttsNeutral, {
      seed,
    });

    const dataUrl = await avatar.toDataUri();

    const body = {
      username: seed,
      image: dataUrl,
    };

    return body;
  }
}
