import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { parse } from 'csv-parse/sync';
import { AddMembersSchema } from './dto/add-members-dto';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { GetMembersQueryDto } from './dto/get-members-query.dto';
import { DeleteMembersDto } from './dto/delete-members.dto';
import { AddSourceDto } from './dto/add-source.dto';

@Controller('threads')
@UseGuards(AuthGuard)
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  create(@Session() session: UserSession, @Body() payload: CreateThreadDto) {
    return this.threadService.create(session.user.id, payload);
  }

  @Get()
  findMany(@Session() session: UserSession) {
    return this.threadService.findMany(session.user.id);
  }

  @Delete('members')
  deleteThreadMembers(@Query() query: DeleteMembersDto) {
    return this.threadService.deleteThreadMembers(query);
  }

  @Delete('/sources/:sourceId')
  deleteSource(@Param('sourceId') id: string) {
    return this.threadService.deleteSource(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.threadService.findOne(id);
  }

  @Post(':id/sources')
  createSource(@Param('id') id: string, @Body() payload: AddSourceDto) {
    return this.threadService.createSource(id, payload);
  }

  @Get(':id/sources')
  findManySource(@Param('id') id: string) {
    return this.threadService.findManySource(id);
  }

  @Get(':id/posts/statistic')
  getPostsStatistic(@Param('id') id: string) {
    return this.threadService.getPostsStatistic(id);
  }

  @Get(':id/members')
  threadMembers(@Param('id') id: string, @Query() query: GetMembersQueryDto) {
    return this.threadService.threadMembers(id, query);
  }

  @Get(':id/members/statistic')
  getMemberStatistic(@Param('id') id: string) {
    return this.threadService.getMemberStatistic(id);
  }

  @Post(':id/members')
  @UseInterceptors(FileInterceptor('file'))
  async addMembers(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'text/csv',
          skipMagicNumbersValidation: true,
        })
        .build(),
    )
    file: Express.Multer.File,
  ) {
    const buffer = file.buffer;
    const parsed = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    const valid = await AddMembersSchema.parseAsync(parsed).catch(() => {
      throw new BadRequestException('Invalid data!');
    });
    return this.threadService.addMembers(id, valid);
  }

  @Post(':id/broadcasts')
  createThread(
    @Param('id') id: string,
    @Session() session: UserSession,
    @Body() payload: CreateBroadcastDto,
  ) {
    return this.threadService.createBroadcast(id, session.user.id, payload);
  }

  @Get(':id/broadcasts/statistic')
  getBroadcastStatistic(@Param('id') id: string) {
    return this.threadService.getBroadcastStatistic(id);
  }
}
