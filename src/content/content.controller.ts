import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { UpdateContentDto } from './dto/update-content.dto';

@Controller('contents')
@UseGuards(AuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  create(@Body() payload: CreateContentDto) {
    return this.contentService.create(payload);
  }

  @Get()
  findMany(@Session() session: UserSession) {
    return this.contentService.findMany(session.user.id);
  }

  @Get('confirmed')
  findManyConfirmed(@Session() session: UserSession) {
    return this.contentService.findManyConfirmed(session.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateContentDto) {
    return this.contentService.update(id, payload);
  }
}
