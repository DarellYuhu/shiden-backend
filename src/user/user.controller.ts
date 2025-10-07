import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findMany() {
    return this.userService.findMany();
  }

  @Get('statistics')
  statistics(@Session() session: UserSession) {
    return this.userService.statistics(session.user.id);
  }
}
