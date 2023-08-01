import { Injectable } from '@nestjs/common';
import { EnvironmentService } from '../../integrations/environment/environment.service';

type Options = {
  next?: string;
  isIntegrate?: string;
  integrateState?: string;
};

@Injectable()
export class SocialService {
  constructor(private readonly env: EnvironmentService) {}

  private getKakaoRedirect({ next, isIntegrate, integrateState }: Options) {
    const state = JSON.stringify({
      next,
      isIntegrate: isIntegrate === 'true' ? 1 : 0,
      integrateState,
    });
    console.log(this.env);
    const clientID = this.env.getKakaoClientId();
    const redirectUri = this.env.getKakaoCallbackUrl();
    return `https://kauth.kakao.com/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;
  }

  generateSocialLoginLink(
    provider: string,
    { next = '/', isIntegrate = 'false', integrateState }: Options,
  ) {
    return this.getKakaoRedirect({
      next: encodeURI(next),
      isIntegrate,
      integrateState,
    });
  }
}
