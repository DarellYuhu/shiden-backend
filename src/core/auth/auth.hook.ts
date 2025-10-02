import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import {
  AfterHook,
  Hook,
  type AuthHookContext,
} from '@thallesp/nestjs-better-auth';

@Hook()
@Injectable()
export class AuthHook {
  constructor(private userService: UserService) {}

  @AfterHook('/sign-in/username')
  async onSignInUsername(ctx: AuthHookContext) {
    await this.createUserHandler(ctx);
  }

  @AfterHook('/sign-up/email')
  async onSignUpEmail(ctx: AuthHookContext) {
    await this.createUserHandler(ctx);
  }

  private async createUserHandler(ctx: AuthHookContext) {
    const session = ctx.context.newSession;
    if (session) {
      const user = await this.userService.findOne(session.user.id);
      if (!user) {
        const payload = {
          id: session.user.id,
          name: session.user.name,
          username: session.user.username as string,
        };
        await this.userService.create(payload);
      }
    }
  }
}
