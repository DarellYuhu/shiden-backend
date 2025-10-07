import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { parse } from 'csv-parse/sync';
import { AddMembersSchema } from './dto/add-members-dto';

@Controller('threads')
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.threadService.findOne(id);
  }

  @Get(':id/members')
  threadMembers(@Param('id') id: string) {
    return this.threadService.threadMembers(id);
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
}
