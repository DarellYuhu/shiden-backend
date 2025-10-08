import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Content } from 'types';
import { MinioService } from 'src/core/minio/minio.service';
import { fileTypeFromBuffer } from 'file-type';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private minio: MinioService,
  ) {}

  async findMany(userId: string) {
    const data = await this.prisma.content.findMany({
      where: { platformAccount: { userId } },
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

  private async getImageBuffer(link: string) {
    const { data } = await lastValueFrom(
      this.http.get<Buffer<ArrayBufferLike>>(link, {
        responseType: 'arraybuffer',
      }),
    );
    return data;
  }
}
