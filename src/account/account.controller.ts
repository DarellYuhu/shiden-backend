import {
  BadRequestException,
  Controller,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import * as Papa from 'papaparse';
import { ZodError } from 'zod';
import { AccountService } from './account.service';
import {
  CreateManyAccountDto,
  CreateManyAccountSchema,
  CreateManyQueryDto,
} from './dto/create-account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('many')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async createMany(
    @UploadedFile(new ParseFilePipeBuilder().build({ fileIsRequired: true }))
    file: Express.Multer.File,
    @Query() query: CreateManyQueryDto,
  ) {
    const text = file.buffer.toString('utf8');
    const parsedCsv = Papa.parse(text, { header: true }).data;
    let valid: CreateManyAccountDto;
    try {
      valid = await CreateManyAccountSchema.parseAsync(parsedCsv);
    } catch (error) {
      if (error instanceof ZodError)
        throw new BadRequestException('Invalid csv data');
    }
    return this.accountService.createMany(valid!, query);
  }
}
