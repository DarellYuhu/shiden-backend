import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { GetStatisticQueryDto } from './dto/get-statistic-query.dto';

@Controller('users')
@UseGuards(AuthGuard)
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

  @Get('statistics/sign-up')
  signUpUsersStatistic(@Query() query: GetStatisticQueryDto) {
    return this.userService.signUpUsersStatistic(query);
  }

  @Get('broadcast')
  getBroadcast(@Session() session: UserSession) {
    return this.userService.getBroadcast(session.user.id);
  }

  @Get('is-new')
  checkIsNewUser(@Session() session: UserSession) {
    return this.userService.checkIsNewUser(session.user.id);
  }
}
