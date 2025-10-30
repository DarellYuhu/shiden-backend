import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateContentDto,
  CreateManualContentDto,
} from './dto/create-content.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Content } from 'types';
import { MinioService } from 'src/core/minio/minio.service';
import { fileTypeFromBuffer } from 'file-type';
import { UpdateContentDto } from './dto/update-content.dto';
import { linkValidator } from 'src/utils';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private minio: MinioService,
  ) {}

  async findMany(userId: string) {
    const data = await this.prisma.content.findMany({
      where: { platformAccount: { userId }, link: null },
      include: {
        contentFile: { select: { file: true } },
        platformAccount: { select: { platform: true } },
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });
    return await Promise.all(
      data.map(async ({ contentFile, platformAccount, ...item }) => ({
        ...item,
        platform: platformAccount.platform,
        files: await Promise.all(
          contentFile.map(async (item) => ({
            ...item.file,
            url: await this.minio.presignedGetObject(
              item.file.bucket,
              item.file.path,
            ),
          })),
        ),
      })),
    );
  }

  async findManyConfirmed(userId: string) {
    const data = await this.prisma.content.findMany({
      where: { platformAccount: { userId }, link: { not: null } },
      include: {
        platformAccount: { select: { platform: true } },
        feed: {
          select: {
            threadMember: { select: { thread: { select: { name: true } } } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    const normalized = data.map(({ platformAccount, feed, ...item }) => ({
      ...item,
      platform: platformAccount.platform,
      thread: feed.threadMember.thread.name,
    }));
    return normalized;
  }

  async findUnique(id: string) {
    return this.prisma.content.findUnique({ where: { id } });
  }

  async createManual(payload: CreateManualContentDto) {
    const platformAcc = await this.prisma.platformAccount.findUniqueOrThrow({
      where: { id: payload.platformAccountId },
    });
    const isValid = linkValidator(payload.link, platformAcc.platform);
    if (!isValid) throw new BadRequestException('Link is not valid!');
    return this.prisma.feed.create({
      data: {
        id: crypto.randomUUID(),
        threadMemberId: payload.threadMemberId,
        isManuallyCreated: true,
        content: {
          create: {
            link: payload.link,
            platformAccountId: payload.platformAccountId,
          },
        },
      },
    });
  }

  async create(payload: CreateContentDto) {
    const feed = await this.prisma.feed.findUnique({
      where: { id: payload.feedId },
    });
    if (!feed) throw new NotFoundException('Feed not found!');
    const content = feed.contentMeta as Content;
    const fileBuffers = await Promise.all(
      content.files.map(async (file) => {
        const buffer = await this.getImageBuffer(file.url);
        return { buffer, file, mime: (await fileTypeFromBuffer(buffer))?.mime };
      }),
    ).catch(() => {
      throw new NotFoundException('Asset cannot be fetch!');
    });
    const fileIds = await Promise.all(
      fileBuffers.map(async (file) => {
        const path = `contents/${payload.feedId}/${file.file.name}`;
        const bucket = 'assets';
        await this.minio.putObject(bucket, path, file.buffer);
        const prismaFile = await this.prisma.file.create({
          data: {
            filename: file.file.name,
            path,
            bucket,
            fullPath: `/${bucket}/${path}`,
            mimeType: file.mime,
          },
        });
        return prismaFile.id;
      }),
    );
    return this.prisma.content.create({
      data: {
        ...payload,
        contentFile: {
          createMany: { data: fileIds.map((id) => ({ fileId: id })) },
        },
      },
    });
  }

  async update(id: string, payload: UpdateContentDto) {
    const content = await this.prisma.content.findUniqueOrThrow({
      where: { id },
      include: { platformAccount: { select: { platform: true } } },
    });

    if (payload.link) {
      const isValid = linkValidator(
        payload.link,
        content.platformAccount.platform,
      );
      if (!isValid) throw new BadRequestException('Link is not valid');
    }
    return this.prisma.content.update({ where: { id }, data: payload });
  }

  async getVideoMetric(url: string) {
    await lastValueFrom(this.http.get(url));
  }

  private async getImageBuffer(link: string) {
    const { data } = await lastValueFrom(
      this.http.get<Buffer<ArrayBufferLike>>(link, {
        responseType: 'arraybuffer',
      }),
    );
    return data;
  }
}
