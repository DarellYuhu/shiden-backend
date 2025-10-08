import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('contents')
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
}
