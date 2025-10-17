import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

@Controller()
@UseGuards(AuthGuard)
export class AppController {
  constructor() {}

  @Get()
  getHello() {
    return { message: 'Shiden API' };
  }
}
